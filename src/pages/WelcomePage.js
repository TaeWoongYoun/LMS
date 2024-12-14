import React from 'react';
import './styles/WelcomePage.css';
import { Navigate } from 'react-router-dom';

function WelcomePage() {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/" />;
    }

    return (
        <div className="welcome-container">
            <main className="main-content">
                <h1 className="welcome-title">인사말</h1>
                <div className="message-box">
                    <p className="message-text">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa soluta repudiandae consequatur asperiores ipsum magni, delectus, nihil quam excepturi libero quia ut magnam, sapiente aliquid porro aspernatur deleniti dolores. Corporis.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa soluta repudiandae consequatur asperiores ipsum magni, delectus, nihil quam excepturi libero quia ut magnam, sapiente aliquid porro aspernatur deleniti dolores. Corporis.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa soluta repudiandae consequatur asperiores ipsum magni, delectus, nihil quam excepturi libero quia ut magnam, sapiente aliquid porro aspernatur deleniti dolores. Corporis.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa soluta repudiandae consequatur asperiores ipsum magni, delectus, nihil quam excepturi libero quia ut magnam, sapiente aliquid porro aspernatur deleniti dolores. Corporis.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa soluta repudiandae consequatur asperiores ipsum magni, delectus, nihil quam excepturi libero quia ut magnam, sapiente aliquid porro aspernatur deleniti dolores. Corporis.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default WelcomePage;