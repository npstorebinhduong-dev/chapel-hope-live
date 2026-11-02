import { createRoot } from "react-dom/client";
import { App, ControlView } from "../App";
import "../style.css";
import "./preview.css";

const clean = new URLSearchParams(location.search).get("view") === "live";
createRoot(document.getElementById("root")!).render(
  clean ? (
    <App />
  ) : (
    <>
      <header className="preview-bar">
        <strong>BẢN XEM THỬ OFFLINE</strong>
        <span>
          50 khách đang chờ · Thử AMEN/quà ở bảng bên cạnh · Tải lại để khởi tạo
          lại.
        </span>
        <a href="./index.html?view=live" target="_blank" rel="noreferrer">
          Mở khung LIVE sạch ↗
        </a>
      </header>
      <div className="preview-layout">
        <section className="preview-stage">
          <App />
        </section>
        <section className="preview-controls">
          <ControlView />
        </section>
      </div>
    </>
  ),
);
