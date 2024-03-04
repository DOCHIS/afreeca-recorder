# 윈도우 사용자를 위한 설명서

# Step-1. 설치하기
## 1. Python
> 이 프로젝트는 python을 사용하진 않지만, streamlink에서 python 3.11 버전을 요구하기 때문에 설치해야 합니다.

1. Python 공식 홈페이지를 방문합니다.

[공식 홈페이지](https://www.python.org/downloads/)

2. "3.11.x" 버전을 다운로드 후 실행합니다.

![python](https://i.imgur.com/sL5RE48.png)

3. 아래 표시 된 항목을 체크 후 'Install Now'를 클릭합니다.

![python2](https://i.imgur.com/lUlni7F.png)

4. 잠시 기다리면 설치가 완료됩니다.

![python3](https://i.imgur.com/sQzgPPD.png)

## 2. Streamlink
> 이 프로젝트는 최소 5.5.1 버전 이상을 요구하지만, 본 설명서에서는 최신 버전인 6.0.1 버전을 기준으로 설명합니다.

1. Streamlink 공식 깃허브 페이지를 방문합니다.

[공식 깃허브 페이지](https://github.com/streamlink/windows-builds/releases)

2. 윈도우 비트에 맞는 최신 버전을 다운로드 후 실행합니다.

![streamlink](https://i.imgur.com/7VIYVCA.png)

3. 'Next'를 클릭

![1page](https://i.imgur.com/TO4ZYjo.png)

4. 'Next'를 클릭

![2page](https://i.imgur.com/Nrq8lxX.png)

5. 'Next'를 클릭

![3page](https://i.imgur.com/pr2euc8.png)

6. 'Next'를 클릭

![4page](https://i.imgur.com/SKVvSPE.png)

7. 'Install'을 클릭

![5page](https://i.imgur.com/IWHm1PT.png)

8. 'Next'를 클릭

![6page](https://i.imgur.com/8oJpaDP.png)

9. 'Finish'를 클릭

![7page](https://i.imgur.com/0UMQv7U.png)

## 3. node.js
> 이 프로젝트는 node.js를 사용합니다. node.js는 18.17 버전을 기준으로 설명합니다.

1. node.js 공식 홈페이지를 방문합니다.

[공식 홈페이지](https://nodejs.org/ko)

2. 18.17.0 버전을 다운로드 후 실행합니다.

![nodejs](https://i.imgur.com/GbQwNcS.png)

3. 절차에 따라 Next를 클릭합니다.

## 4. afreeca-recorder
> 이제 마지막으로 afreeca-recorder를 설치하겠습니다.

1. afreeca-recorder 공식 깃허브 페이지를 방문합니다.

[공식 깃허브 페이지](https://github.com/DOCHIS/afreeca-recorder)

2. 'Code'를 클릭 후 'Download ZIP'을 클릭합니다.

![download](https://i.imgur.com/OmZwL8D.png)

3. 원하시는 경로에 압축을 풀어줍니다.

4. 아래 사진과 같이 현재 경로에서 CMD를 실행 후 ``npm install``을 입력합니다. 잠시 기다리면 설치가 완료됩니다.

![cmd](https://i.imgur.com/thzQjeh.gif)

5. app.js 파일을 메모장으로 열어 설정을 수정합니다.

# 설정하기
주요 설정과 설정 값에 대한 정보는 app.js 파일 내에 주석으로 설명되어 있습니다.

가장 기본이 되는 ``userId``, ``userPassword``를 설정하고 나머지 설정은 필요에 따라 수정하시면 됩니다.


# 실행하기
아까와 마찬가지로 현재 경로에서 CMD를 실행 후 ``node app.js <BJ의 아이디> <화질>`` 을 입력하면 프로그램이 실행됩니다.

BJ의 아이디는 아프리카TV의 BJ 아이디를 입력하시면 됩니다. BJ의 아이디는 필수 입력 항목입니다.

화질은 입력하지 않으면 최고 화질로 녹화됩니다. 화질은 ``sd``, ``hd``, ``original`` 중 하나를 입력하시면 됩니다.

영상은 output 폴더에 저장됩니다.
