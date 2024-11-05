const poketmon = [
    {id : 1, name : '이상해씨', type : '풀', url : "image/000101.png"},
    {id : 2, name : '이상해풀', type : '풀', url : "image/000201.png"},
    {id : 3, name : '이상해꽃', type : '풀', url : "image/000301.png"},
    {id : 4, name : '메가이상해꽃', type : '풀', url : "image/000302.png"},
    {id : 5, name : '파이리', type : '불꽃', url : "image/000401.png"},
    {id : 6, name : '리자드', type : '불꽃', url : "image/000501.png"},
    {id : 7, name : '리자몽', type : '불꽃, 비행', url : "image/000601.png"},
    {id : 8, name : '메가리자몽Y', type : '불꽃, 비행', url : "image/000604.png"},
    {id : 9, name : '꼬부기', type : '물', url : "image/000701.png"},
    {id : 10, name : '어니부기', type : '물', url : "image/000801.png"},
    {id : 11, name : '거북왕', type : '물', url : "image/000901.png"},
    {id : 12, name : '메가거북왕', type : '물', url : "image/000902.png"},
    {id : 13, name : '피카츄', type : '전기', url : "image/002501.png"},
    {id : 14, name : '라이츄', type : '전기', url : "image/002601.png"},
    {id : 15, name : '메타몽', type : '노말', url : "image/013201.png"},
    {id : 16, name : '이브이', type : '노말', url : "image/013301.png"},
    {id : 16, name : '샤미드', type : '물', url : "image/013401.png"},
    {id : 16, name : '쥬피썬더', type : '전기', url : "image/013501.png"},
    {id : 16, name : '부스터', type : '불꽃', url : "image/013601.png"},
    {id : 16, name : '뮤츠', type : '에스퍼', url : "image/015001.png"},
    {id : 16, name : '뮤', type : '에스퍼', url : "image/015101.png"}
]

const list = document.getElementById('list');

function showList(val=''){
    list.innerHTML = '';
    const res = poketmon.forEach(poketmon => {
        if (poketmon.name.includes(val)){
            const li = document.createElement('li');
            li.innerHTML = ` 
            <img src="${poketmon.url}" alt="${poketmon.name}">
            <p>이름 : ${poketmon.name}</p>
            <p>속성 : ${poketmon.type}</p>
            `
            list.appendChild(li);
        }
    })
}

showList('');

const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const val = searchInput.value;
    showList(val);
})