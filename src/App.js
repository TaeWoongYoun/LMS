import React, { useState } from 'react';
import './App.css';

function App() {
    const [selected, setSelected] = useState(null);

    const iframeData = [
        { module: "Amodule", name: "아코디언", path: "/Amodule/accordion", title: "Amodule-Accordion" },
        { module: "Amodule", name: "큐브", path: "/Amodule/cube/index.html", title: "Amodule-Cube" },
        { module: "Amodule", name: "달", path: "/Amodule/LunarEclipse/index.html", title: "Amodule-LunarEclipse" },
        { module: "Amodule", name: "모달", path: "/Amodule/modal/index.html", title: "Amodule-Modal" },
        { module: "Amodule", name: "슬라이드", path: "/Amodule/slide/index.html", title: "Amodule-Slide" },
    ];

    const handleSelect = (data) => {
        setSelected(data);
    };

    return (
        <div className="App">
            <h1>모듈 목록</h1>
            <table className="module-table">
                <thead>
                    <tr>
                        <th>폴더명</th>
                        <th>세부 폴더명</th>
                    </tr>
                </thead>
                <tbody>
                    {iframeData.map((item, index) => (
                        <tr key={index} onClick={() => handleSelect(item)} className="table-row">
                            <td>{item.module}</td>
                            <td>{item.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selected && (
                <div className='iframe-area'>
                    <h1>{selected.name}</h1>
                    <iframe
                        src={selected.path}
                        title={selected.title}
                    ></iframe>
                </div>
            )}
        </div>
    );
}

export default App;
