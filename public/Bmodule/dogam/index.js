var data = [
    {id : 1, url : "image/agumon.jpg"},
    {id : 2, url : "image/agumon-black.jpg"},
    {id : 3, url : "image/bowmon.jpg"},
    {id : 4, url : "image/culumon.jpg"},
    {id : 5, url : "image/moonmon.jpg"},
    {id : 6, url : "image/sunmon.jpg"},
    {id : 7, url : "image/yukiagumon.jpg"}
]

function card(products){
    products.forEach(element => {
        var imgBox = `
        <div class="card">
            <img src="${element.url}" alt="">
        </div>`;
        document.querySelector('.dogam').insertAdjacentHTML('beforeend', imgBox);
    });
}

card(data)