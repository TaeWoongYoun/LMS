import React, { useState } from 'react';
import './App.css';
import iframeData from './data/iframeData';

function App() {
    const [selected, setSelected] = useState(null);

    const handleSelect = (data) => {
        setSelected(data);
    };

    return (
        <div className="App">
            <h1>모듈 목록</h1>
            <div className='table-area'>
              <table className="module-table">
                  <thead>
                      <tr>
                          <th>난이도</th>
                          <th>폴더명</th>
                          <th>세부 폴더명</th>
                      </tr>
                  </thead>
                  <tbody>
                      {iframeData.map((item, index) => (
                          <tr key={index} onClick={() => handleSelect(item)} className="table-row">
                              <td>{item.level}</td>
                              <td>{item.module}모듈</td>
                              <td>{item.name}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>

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
