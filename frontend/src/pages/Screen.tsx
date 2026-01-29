import React from "react";
import "./Screen.css";

export default function StockPage() {
    return (
        <div className="container">
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontSize: '30px' }}>Responsive Grid Layout</h1>
            <div className="grid-container">
                <div className="grid-item">
                    <h3>Card 1</h3>
                    <p>This is the first item in our responsive grid layout.</p>
                </div>
                <div className="grid-item">
                    <h3>Card 2</h3>
                    <p>This is the second item that will adapt to different screen sizes.</p>
                </div>
                <div className="grid-item">
                    <h3>Card 3</h3>
                    <p>This is the third item showing responsive behavior.</p>
                </div>
                <div className="grid-item">
                    <h3>Card 4</h3>
                    <p>This is the fourth item in our grid system.</p>
                </div>
                <div className="grid-item">
                    <h3>Card 5</h3>
                    <p>This is the fifth item demonstrating the layout.</p>
                </div>
                <div className="grid-item">
                    <h3>Card 6</h3>
                    <p>This is the sixth item completing our example.</p>
                </div>
            </div>
        </div>
    );
}
