/**
 * 아프리카TV 자동 녹화 프로그램
 *
 * < 사용법 >
 * "설정값 부분을 수정한 후, 아래 명령어로 실행
 * node app.js 채널ID 화질
 */

const fs = require("fs");
const fetch = require("node-fetch");
const { spawn } = require("child_process");

class afreecaRecorder {
  /**
   * 생성자
   */
  constructor() {
    /**
     *
     * 설정값 안내
     * userId = 아프리카에 로그인 할 때 사용하는 아이디
     * userPassword = 아프리카에 로그인 할 때 사용하는 비밀번호
     * savePath = 녹화 파일 저장 경로
     * checkInterval = 방송 정보를 가져오는 주기 (최소 4000ms 이상)
     *  - 단위는 ms 입니다.
     * userAgent = User-Agent 값 (기본값은 윈도우 11 크롬)
     *  - < 설정값 예시 >
     *  - 윈도우(파이어폭스) : Mozilla/5.0 (Windows NT 10.0; rv:88.0) Gecko/20100101 Firefox/88.0
     *  - 윈도우(크롬) : Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.122 Whale/
     *  - 맥(파이어폭스) : Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0
     *  - 맥(사파리) : Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15
     *  - 맥(크롬) : Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.122 Whale/
     * streamLinkPath = streamlink 실행 파일 경로 (streamlink가 설치되어 있어야 함)
     * collectDetailLog = 상세 로그 수집 여부 (true/false)
     *  - true로 설정하면 상세 로그를 수집합니다.
     *  - false로 설정하면 상세 로그를 수집하지 않습니다.
     *  - 상세 로그는 ./logs/에 저장됩니다.
     *  - 방송정보와 녹화정보를 수집합니다.
     *
     * 파라미터 안내
     * channelId = 녹화할 방송국의 ID (지정하지 않으면 기본값으로 설정됨)
     *  - 기본값 : 하나나 방송국
     * recordQuality = 녹화 화질 (기본값은 original)
     *  - 지원되는 값 : sd (worst), hd, original (best)
     * 파라미터는 아래 실행 방법처럼 실행 시 입력하면 됨
     *
     * 실행 방법
     * node app.js <채널ID> <화질>
     */

    // ** 설정값 **
    this.userId = "############";
    this.userPassword = "############";
    this.savePath = "./output/";

    // 특별한 일 없으면 수정할 필요 없음
    this.checkInterval = 4000;
    this.userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.122 Whale/3.16.138.27 Safari/537.36";
    this.streamLinkPath = "streamlink";
    this.collectDetailLog = false;
    this.collectDetailLogPath = "./log/";

    // ** 파라미터 **
    this.channelId = process.argv[2];
    this.recordQuality = process.argv[3] || "original";

    this.primaryLiveInfo = null;
    this.secondaryLiveInfo = null;

    this.streamLinkPids = [];
    this.isLive = false;
  }

  /**
   * 시작
   */
  async start() {
    if (this.channelId === undefined) {
      console.error("> channelId 설정이 필요합니다.");
      return;
    }

    if (this.userId === "" || this.userPassword === "") {
      console.error("> userId, userPassword 설정이 필요합니다.");
      return;
    }

    if (this.checkInterval < 4000) {
      console.error("> checkInterval은 4000ms 이상이어야 합니다.");
      return;
    }

    if (this.savePath === "") {
      console.error("> savePath 설정이 필요합니다.");
      return;
    }

    console.log("");
    console.log("┏ 아프리카TV 자동 녹화 프로그램 시작");
    console.log("┃ 채널ID:", this.channelId);
    console.log("┃ 화질:", this.recordQuality);
    console.log("┃ 체크주기:", this.checkInterval + "ms");
    console.log("┗ Ctrl + C 로 종료 가능");
    console.log("");

    this.createPath(this.savePath);
    await this.loop();
  }

  /**
   * 반복
   */
  async loop() {
    // 아프리카 방송 정보 가져오기
    try {
      // primaryLiveInfo에 방송 정보 저장
      this.primaryLiveInfo = await this.getAfreecaLiveInfo();
      this.isLive = this.primaryLiveInfo.broad != null;

      if (!this.isLive) {
        // 방송중이 아닌 경우
        console.log(
          this.now() +
            `>> ${this.channelId}은 방송중이 아닙니다... ${
              this.checkInterval / 1000
            }초 후 다시 체크합니다.`
        );

        // streamLinkPids 하나씩 pop 하면서 종료
        while (this.streamLinkPids.length > 0) {
          const pid = this.streamLinkPids.pop();
          process.kill(pid);
        }
      } else {
        // 방송중인 경우
        await this.recordController();
      }

      // secondaryLiveInfo에 primaryLiveInfo 복사
      this.secondaryLiveInfo = this.primaryLiveInfo;
    } catch (e) {
      console.log(this.now() + ">> 통신 중 오류가 발생했습니다:", e);
    }

    // 다음 체크
    setTimeout(() => {
      this.loop();
    }, this.checkInterval);
  }

  /**
   * 녹화 컨트롤러
   */
  async recordController() {
    const primaryTitle = this.primaryLiveInfo.broad?.broad_title;
    const secondaryTitle = this.secondaryLiveInfo?.broad?.broad_title;
    const isPassword = this.primaryLiveInfo?.broad?.is_password;
    
    // YYYY-MM-DD HHMMSS 형식으로 now 변수 선언
    const now = this.now("path");
    let fileName = `[${this.channelId}]${now}--${primaryTitle}.ts`;
    let fileSrc = `${this.savePath}${fileName}`;

    if(isPassword === true){
      if(this.streamLinkPids.length > 0){
        if (primaryTitle !== secondaryTitle) {
          console.log(this.now() + `>> 제목변경이 감지되었지만, 비밀번호 설정이 되어있어 파일을 끊을 수 없습니다.`);
        }
      } else {
        console.log(this.now() + `>> 방송이 비공개 방송입니다. ${
          this.checkInterval / 1000
        }초 후 다시 체크합니다.`);
      }
    } else {
      if (primaryTitle !== secondaryTitle) {
        // 제목 변경이 감지될 경우
        if (primaryTitle && secondaryTitle) {
          console.log(this.now() + `>> 방송 제목 변경이 감지되었습니다.`);
          console.log(this.now() + `>> 녹화 종료: ${secondaryTitle}`);
        }

        // 파일명이 중복될 경우 파일명 뒤에 숫자를 붙임
        let i = 1;
        while (fs.existsSync(fileSrc)) {
          fileName = `[${this.channelId}]${now}--${primaryTitle}--(${i}).ts`;
          fileSrc = `${this.savePath}${fileName}`;
          i++;
        }

        // 파일 시스템에서 사용할 수 없는 문자 제거
        fileName = fileName.replace(/[/\\?%*:|"<>]/g, "-");
        fileSrc = `${this.savePath}${fileName}`;
        console.log(this.now() + `>> 녹화 시작: ${primaryTitle}`);
        console.log(this.now() + `>> 녹화 파일: ${fileName}`);

        // streamlink 실행
        const streamlink = spawn(this.streamLinkPath, [
          "--afreeca-username",
          this.userId,
          "--afreeca-password",
          this.userPassword,
          "--afreeca-purge-credentials",
          "play.afreecatv.com/" + this.channelId,
          this.recordQuality,
          "-o",
          fileSrc,
        ]);

        // streamlink PID 저장
        this.streamLinkPids.push(streamlink.pid);

        streamlink.stdout.on("data", (data) => {
          console.log(this.now() + `>> streamlink 로그: ${data}`);
        });

        streamlink.stderr.on("data", (data) => {
          console.error(this.now() + `>> streamlink 로그: ${data}`);
        });

        streamlink.on("close", (code) => {
          console.log(
            this.now() + `>> streamlink 로그: 프로세스 종료 (코드:${code})`
          );
        });

        // streamLinkPids가 2개 이상인 경우 첫번째 PID를 종료
        if (this.streamLinkPids.length > 1) {
          const pid = this.streamLinkPids.shift();
          console.log(this.now() + `>> streamlink 종료: ${pid}`);
          process.kill(pid);
        }
      }
    }
  }

  /**
   * 폴더 생성
   * @param path
   */
  async createPath(path) {
    const pathArr = path.split("/");
    let pathStr = "";
    for (let i = 0; i < pathArr.length; i++) {
      pathStr += pathArr[i] + "/";
      if (!fs.existsSync(pathStr)) {
        fs.mkdirSync(pathStr);
      }
    }
  }

  /**
   * 아프리카 방송 정보 가져오기
   * @returns {Promise<*>}
   */
  async getAfreecaLiveInfo() {
    const url = `https://bjapi.afreecatv.com/api/${this.channelId}/station`;
    const query = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": this.userAgent,
      },
      timeout: this.checkInterval - 100,
    });
    const data = await query.json();
    this.writeLogs(data);
    return data;
  }

  /**
   * 상세 로그 쓰기
   */
  writeLogs(log) {
    const logPath = this.collectDetailLogPath;
    this.createPath(logPath);

    const fileName = this.now("path").split("_")[0] + ".txt";
    const fileSrc = logPath + fileName;

    log = typeof log == "object" ? JSON.stringify(log) : log;
    log = this.now() + " >> " + log + "\n";

    fs.appendFile(fileSrc, log, (err) => {
      if (err) console.log(this.now() + " >> 로그 파일 쓰기 실패:", err);
    });
  }

  /**
   * 현재 시간
   */
  now(type = "log") {
    const date = new Date();
    const year = date.getFullYear();
    const shortYear = String(year).substr(2, 2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return type == "log"
      ? `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`
      : `${shortYear}${month}${day}_${hours}${minutes}${seconds}`;
  }
}

// 아프리카TV 자동 녹화
new afreecaRecorder().start();
