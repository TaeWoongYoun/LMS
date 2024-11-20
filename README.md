# LMS 프로젝트 개요

기능반 후배들한테 공부했던 모든거 물려주는 LMS 프로젝트

### 1일차
- **A 모듈 파일 추가**: A 모듈에 해당하는 파일을 서버에 추가.
- **모듈 파일 리스트**: 선택한 모듈에 해당하는 파일을 테이블 형식으로 표현.
- **iframe 실행 화면**: 로드한 파일을 iframe을 실시간으로 렌더링.
- **코드 확인 기능**: 각 과제에 대한 HTML, CSS, JavaScript 코드를 확인할 수 있는 기능 추가.

### 2일차
- **B 모듈 파일 추가**: B 모듈에 해당하는 파일을 서버에 추가.
- **난이도 및 모듈 설정**: select를 사용하여 사용자가 난이도와 모듈을 선택할 수 있는 기능 추가.
- **검색 기능**: 사용자가 입력한 키워드로 과제를 검색할 수 있는 기능 추가.
- **Prism.js 사용**: 코드 확인 영역에서 Prism.js를 활용하여 실제 에디터처럼 보여주도록 개선.
- **서브페이지 기능 구현**: 테스트 서브페이지 추가.

### 3일차
- **코드 확인 기능에 비밀번호 설정**: 코드 확인 버튼에 비밀번호 입력 기능 추가.
- **푸터 제작**: GitHub 및 Instagram 아이콘을 추가하고 SNS 링크를 새 탭에서 열리도록 설정.

### 4일차
- **Node.js 테스트**: Node.js 서버 기능을 초기 테스트.

### 5일차
- **INSERT 페이지 제작**: 새로운 데이터를 입력할 수 있는 INSERT 페이지 구현.

### 6일차
- **로그인/회원가입 기능 통합 테스트**: "윤도연"이 개발한 로그인 및 회원가입 기능을 병합하고 테스트 진행.

### 7일차
- **로그인/회원가입 기능 구현**: 사용자 인증을 위한 로그인 및 회원가입 기능을 구현하고 서버와 연동하여 데이터 처리.
- **각 서브페이지 스타일링**: 서브페이지의 UI 디자인을 개선하여 일관된 스타일을 적용.
- **인사말 페이지 제작**: 인사말 페이지 기본 디자인 설정.

### 8일차
- **로그아웃 기능 및 상호작용**: 로그아웃을 하며 일어나는 다양한 상호작용 구현.
- **delete 페이지 제작**: 관리자 권한으로 기존의 데이터를 삭제할 수 있는 delete 페이지 구현.

### 9일차
- **회원관리 페이지 제작**: 회원 조회 및 삭제가 가능한 페이지 구현

### 10일차
- **회원 권한 관리 기능 제작**: 관리자 페이지에서 일반 회원과 담당자로 구분하여 회원의 권한을 관리할 수 있는 기능 구현

### 11일차
- **담당자 권한 생성**: 일반 회원, 담당자, 관리자로 권한을 세분화하여 각각의 역할과 접근 권한을 차별화
- **과제 제출 기능 구현**: 일반 회원이 과제를 이미지 형태로 제출하고 설명을 작성할 수 있는 기능 개발
- **과제 확인 기능 구현**: 담당자와 관리자가 제출된 과제를 확인하고 관리할 수 있는 페이지 구현
- **과제 완료 기능 구현**: 미제출/검토 중/완료 상태를 아이콘으로 표시하여 과제의 진행 상태를 직관적으로 확인할 수 있는 기능 개발

### 12일차
- **데이터 관리 구조 개선**: 정적 JS 파일로 관리되던 모듈 데이터를 DB로 마이그레이션

### 13일차
- **랭크 페이지 제작**: 푼 과제들의 갯수와 난이도를 계산해서 랭킹을 부여하는 랭크페이지 제작

## 프로젝트 클론하기

```bash
git clone https://github.com/TaeWoongYoun/react-start.git
cd react-start
npm install
npm start

디렉토리 삭제:
rmdir /s /q react-start
```

## 기술 스택
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Prism.js](https://img.shields.io/badge/Prism.js-2E3A44?style=for-the-badge&logo=prism&logoColor=white)](https://prismjs.com/)
[![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3schools.com/css/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
