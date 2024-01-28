## express + ejs 를 이용해 링크 단축 사이트 만들기

### 배포 상황

http://sogumn.kro.kr:5002/

<img width="1014" alt="image" src="https://github.com/keinn51/shorten_link_express/assets/79993356/7fc7b558-ca64-4ca1-aa9b-c63d0aaef888">

### 주요 개발 사항

- 라즈베리파이를 이용해 직접 서버를 구성했습니다.
- 포트포워딩을 통해 특정 외부 IP로, 내부 IP의 리소스 접근을 가능하게 했습니다.
- express와 ejs를 이용하여 화면을 구성했습니다.
- 진입 port에서 진입 url을 기준으로 구분하여, 사용자가 원하는 리소스가 있는 port에 접근합니다.

### 개발 예정 (24.01.21 기준)
- https를 적용해야 합니다.
- 포트 번호를 제외해도 사이트 접속이 가능하도록 해야합니다.
- 반응형 작업을 해야합니다.
