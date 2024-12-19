CREATE TABLE boards (
   id INT AUTO_INCREMENT PRIMARY KEY,
   category ENUM('news','qna','free','notice') NOT NULL,
   title VARCHAR(255) NOT NULL,
   content TEXT NOT NULL, 
   author_id VARCHAR(255) NOT NULL,
   author_name VARCHAR(255) NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   INDEX(author_id)
);

CREATE TABLE iframe_data (
   idx INT AUTO_INCREMENT PRIMARY KEY,
   level INT NOT NULL,
   module VARCHAR(10) NOT NULL,
   name VARCHAR(255) NOT NULL,
   description TEXT NOT NULL,
   path VARCHAR(255) NOT NULL,
   title VARCHAR(255) NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE board_posts (
   id INT AUTO_INCREMENT PRIMARY KEY,
   category ENUM('news','qna','free','notice') NOT NULL,
   title VARCHAR(255) NOT NULL,
   content TEXT NOT NULL,
   author_id VARCHAR(255) NOT NULL,
   author_name VARCHAR(255) NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   INDEX(author_id)
);

CREATE TABLE comments (
   id INT AUTO_INCREMENT PRIMARY KEY,
   post_id INT NOT NULL,
   author_id VARCHAR(255) NOT NULL,
   author_name VARCHAR(255) NOT NULL,
   content TEXT NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   INDEX(post_id)
);

CREATE TABLE completed_assignments (
    idx INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255),
    assignment_name VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    github_url VARCHAR(255),
    user_id VARCHAR(20),
    INDEX(user_name),
    INDEX(user_id)
);

CREATE TABLE user (
    idx INT AUTO_INCREMENT PRIMARY KEY,
    id VARCHAR(50) NOT NULL UNIQUE,
    pw VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('user', 'manager', 'admin') DEFAULT 'user',
    github_id VARCHAR(255),
    github_token VARCHAR(255)
);

CREATE TABLE submissions (
    idx INT AUTO_INCREMENT PRIMARY KEY,
    submit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    module_id VARCHAR(100),
    assignment_name VARCHAR(255) NOT NULL,
    assignment_path VARCHAR(255) NOT NULL,
    github_url VARCHAR(255),
    user_id VARCHAR(50),
    user_name VARCHAR(255),
    INDEX(user_id)
);

INSERT INTO iframe_data (level, module, name, description, path, title) VALUES 
(3, 'A', '아코디언', '세로 드롭다운 형태의 아코디언 메뉴', '/Amodule/accordion/index.html', 'Amodule-Accordion'),
(1, 'A', '뱃지', 'Button을 활용한 SNS 메시지 버튼 디자인', '/Amodule/badge/index.html', 'Amodule-Badge'),
(2, 'A', '배터리', '배터리 모양의 애니메이션 효과', '/Amodule/battery/index.html', 'Amodule-Battery'),
(3, 'A', '버튼 캐러셀', '버튼으로 조작하는 이미지 슬라이드', '/Amodule/btnSlide/index.html', 'Amodule-BtnSlide'),
(1, 'A', '버튼', '그라데이션, 이미지 등으로 꾸민 다양한 버튼 디자인', '/Amodule/button/index.html', 'Amodule-Button'),
(1, 'A', '계산기', '기본적인 계산기 디자인', '/Amodule/calculator/index.html', 'Amodule-Calculator'),
(1, 'A', '캘린더', 'ul, li 요소를 활용한 간단한 달력', '/Amodule/calender/index.html', 'Amodule-Calendar'),
(1, 'A', '카드', '이미지와 설명을 포함한 카드 모양의 박스', '/Amodule/card/index.html', 'Amodule-Card'),
(0, 'A', '가운데 정렬', 'flex, absolute, grid을 활용한 다양한 가운데 정렬 방법', '/Amodule/center/index.html', 'Amodule-Center'),
(4, 'A', '3D 정육면체', '360도 회전하는 정육면체 애니메이션', '/Amodule/cube/index.html', 'Amodule-Cube'),
(0, 'A', '마우스 커서', '커서 스타일 변경 효과', '/Amodule/cursor/index.html', 'Amodule-Cursor'),
(1, 'A', '클릭 아코디언', 'details, summary 태그를 이용한 아코디언', '/Amodule/dropdown/index.html', 'Amodule-Dropdown'),
(2, 'A', '로그인 페이지', '탭 메뉴와 다양한 input type으로 구성된 로그인 페이지', '/Amodule/form/index.html', 'Amodule-Form'),
(1, 'A', '방 설계도', '포지션 속성을 사용한 간단한 방 설계도', '/Amodule/house/index.html', 'Amodule-House'),
(1, 'A', '간단한 키보드', '간단한 키보드 디자인', '/Amodule/keyboard/index.html', 'Amodule-Keyboard'),
(3, 'A', '월식', '월식 애니메이션', '/Amodule/LunarEclipse/index.html', 'Amodule-LunarEclipse'),
(2, 'A', '지도', '지도 상에서 움직이는 버스 애니메이션', '/Amodule/map/index.html', 'Amodule-Map'),
(0, 'A', '간단한 사이트', '쉽게 제작 가능한 사이트 예시 (로그인 페이지 등)', '/Amodule/miniSite/index.html', 'Amodule-Minisite'),
(1, 'A', '모달창', '클릭 시 팝업되는 광고/설명창', '/Amodule/modal/index.html', 'Amodule-Modal'),
(0, 'A', '마우스 이벤트', 'css의 다양한 마우스 이벤트 모음', '/Amodule/mouse/index.html', 'Amodule-Mouse'),
(0, 'A', '네비게이션', 'nav, ul, li를 사용해서 만든 네비게이션 예제', '/Amodule/nav/index.html', 'Amodule-Nav'),
(2, 'A', '네비게이션(dropdown)', '웹디자인 기능사에 나오는 드롭다운 메뉴', '/Amodule/nav/DropDownMenu/index.html', 'Amodule-Nav'),
(2, 'A', '네비게이션{dropdown(subbox)}', '드롭다운 메뉴에 서브박스 기능을 더한', '/Amodule/nav/DropDownMenu/subBox/index.html', 'Amodule-Nav'),
(1, 'A', '네비게이션(desgin1)', '네비게이션 디자인1', '/Amodule/nav/inputNav/index.html', 'Amodule-Nav'),
(1, 'A', '네비게이션(desgin2)', '네비게이션 디자인2', '/Amodule/nav/navigation/index.html', 'Amodule-Nav'),
(4, 'A', '3D 피라미드', '회전하는 3D 피라미드 애니메이션', '/Amodule/pyramid/index.html', 'Amodule-Pyramid'),
(2, 'A', '로딩창1', '로딩 애니메이션1', '/Amodule/roding/droplet_spinner/index.html', 'Amodule-Roding'),
(2, 'A', '로딩창2', '로딩 애니메이션2', '/Amodule/roding/heart_spinner/index.html', 'Amodule-Roding'),
(1, 'A', '스크롤 박스', '스크롤 기능이 포함된 작은 박스와 디자인된 스크롤바', '/Amodule/scrollBox/index.html', 'Amodule-ScrollBox'),
(1, 'A', '슬라이드', '다양한 형태의 이미지 슬라이드 및 캐러셀', '/Amodule/slide/index.html', 'Amodule-Slide'),
(2, 'A', '정지 캐러셀', '정지 버튼을 누르거나 호버 시 정지하는 슬라이드', '/Amodule/stopSlide/index.html', 'Amodule-StopSlide'),
(4, 'A', '움직이는 추', '움직이는 추 애니메이션', '/Amodule/swing/index.html', 'Amodule-Swing'),
(3, 'A', '탭메뉴', '간단한 탭 메뉴 구현', '/Amodule/tebmenu/index.html', 'Amodule-Tebmenu'),
(1, 'A', '다양한 사이트1', '미리캔버스 사이트 디자인 연습용', '/Amodule/variousSite/SITE1/index.html', 'Amodule-VariousSite'),
(1, 'A', '다양한 사이트2', '춘식이 사이트 디자인 연습용', '/Amodule/variousSite/SITE3/index.html', 'Amodule-VariousSite'),
(3, 'A', '웹디자인기능사 문제 풀이(D-1)', '웹디자인기능사 실기 문제풀이', '/Amodule/WebTechnician/D-1/index.html', 'Amodule-WebTechnician'),
(0, 'A', '와이어프레임(기본)', '와이어프레임 연습문제', '/Amodule/wireframe/index.html', 'Amodule-Wireframe'),
(0, 'A', '와이어프레임(유형A)', '웹디자인기능사 공개문제 A-1 와이어프레임', '/Amodule/wireframe/A/index.html', 'Amodule-Wireframe'),
(0, 'A', '와이어프레임(유형B)', '웹디자인기능사 공개문제 B-1 와이어프레임', '/Amodule/wireframe/B/index.html', 'Amodule-Wireframe'),
(0, 'A', '와이어프레임(유형C)', '웹디자인기능사 공개문제 C-1 와이어프레임', '/Amodule/wireframe/C/index.html', 'Amodule-Wireframe'),
(0, 'A', '와이어프레임(유형D)', '웹디자인기능사 공개문제 D-1 와이어프레임', '/Amodule/wireframe/D/index.html', 'Amodule-Wireframe'),
(0, 'A', '와이어프레임(유형E)', '웹디자인기능사 공개문제 E-1 와이어프레임', '/Amodule/wireframe/E/index.html', 'Amodule-Wireframe'),
(1, 'B', '숫자 증가 텍스트 추가', '버튼을 누를 때마다 숫자가 증가하며 텍스트 추가', '/Bmodule/addText/index.html', 'B-AddText'),
(2, 'B', '버튼 슬라이드', '버튼 슬라이드 기능 구현', '/Bmodule/btnSlide/index.html', 'B-BtnSlide'),
(1, 'B', '간단한 계산기', '간단한 계산기 기능 구현', '/Bmodule/calculator/index.html', 'B-Calculator'),
(1, 'B', '색상 플리퍼', '버튼 클릭 시 텍스트와 박스의 색상이 랜덤으로 변환', '/Bmodule/color-flipper/index.html', 'B-ColorFlipper'),
(1, 'B', '숫자 카운터', '숫자 증가, 감소 및 초기화 기능', '/Bmodule/counter/index.html', 'B-Counter'),
(1, 'B', '랜덤 색상 박스 생성', '랜덤 색상의 박스 생성 기능', '/Bmodule/createBox/index.html', 'B-CreateBox'),
(2, 'B', '데이터 출력', 'foreach문을 활용한 데이터 출력', '/Bmodule/dogam/index.html', 'B-Dogam'),
(2, 'B', '드래그 이벤트', '드래그 이벤트 기능 구현', '/Bmodule/dragEventStart/index.html', 'B-DragEventStart'),
(3, 'B', '드래그 이벤트2', '드래그 이벤트 기능 구현2', '/Bmodule/dragEvent2/index.html', 'B-DragEvent2'),
(2, 'B', 'FAQ 페이지', '아코디언 기능을 사용한 FAQ 페이지 구현', '/Bmodule/FAQ/index.html', 'B-FAQ'),
(1, 'B', '폰트 크기 조정', '버튼으로 폰트 및 박스 크기 조정과 랜덤 색상 적용', '/Bmodule/fontSizeUp/index.html', 'B-FontSizeUp'),
(2, 'B', '이미지 슬라이드', '자동 이미지 슬라이드 기능 구현', '/Bmodule/imgSlide/index.html', 'B-ImgSlide'),
(1, 'B', '화면 키보드 입력', '화면의 키보드를 클릭하여 검색창에 텍스트 입력 기능 구현', '/Bmodule/keyboard/index.html', 'B-Keyboard'),
(2, 'B', '파일 업로드 표시', '내 컴퓨터의 파일을 업로드하여 화면에 표시', '/Bmodule/loadFile/index.html', 'B-LoadFile'),
(1, 'B', '모달창', '함수를 사용한 모달창 구현', '/Bmodule/modal/index.html', 'B-Modal'),
(3, 'B', '리뷰 캐러셀', '이전, 다음, 랜덤 버튼이 포함된 리뷰 캐러셀 기능', '/Bmodule/reviewCarousel/index.html', 'B-ReviewCarousel'),
(4, 'B', '포켓몬 검색', '포켓몬 검색 기능 구현', '/Bmodule/search/index.html', 'B-Search'),
(5, 'B', '테트리스', '테트리스 게임 제작', '/Bmodule/tatris/index.html', 'B-Tatris');