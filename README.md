# Ren'Py RPA Studio

A sleek, 100% client-side web application to **unpack and pack Ren'Py Archive (`.rpa`) files** directly inside your browser — no backend, no Python installation, and no external tools required.

🚀 **Live Demo:** [https://im-n10s.github.io/Ren-Py-RPA-Studio/](https://im-n10s.github.io/Ren-Py-RPA-Studio/)

---

## ✨ Features

- **100% Client-Side Processing:** All files are processed locally in your browser memory — nothing is ever uploaded to a server.
- **Unpack `.rpa` Archives:** Supports both **RPA-3.0** and **RPA-2.0** formats (Python Pickle Protocols 0–5), with individual file downloads or full `.zip` export preserving folder structure.
- **Pack to `.rpa`:** Bundle multiple files or entire folders into a valid **RPA-3.0** archive ready for Ren'Py.
- **Bilingual Support:** Full **English** and **Arabic (RTL)** interface with smooth language switching.
- **Dark & Light Themes:** Refined Purple Haze Liquid Glass UI with animated theme switching.

---

## 🛠️ Tech Stack

- Pure **HTML5**, **CSS3**, and **Vanilla JavaScript**
- [pako](https://github.com/nodeca/pako) for zlib compression/decompression
- [JSZip](https://stuk.github.io/jszip/) for `.zip` archive generation
- Custom JavaScript Python Pickle parser & Protocol 2 serializer

---

## 💻 Run Locally

Just clone the repository and open `index.html` in any modern browser:

```bash
git clone [https://github.com/im-n10s/Ren-Py-RPA-Studio.git](https://github.com/im-n10s/Ren-Py-RPA-Studio.git)
cd Ren-Py-RPA-Studio

👤 Author
Made with ❤️ by n10s_exe

X (Twitter): @n10s_exe

GitHub: @im-n10s