<div align="center">

# Ren'Py RPA Studio

**A modern, 100% client-side web tool to unpack and pack Ren'Py (`.rpa`) archives directly in your browser — no backend, no Python, and no external downloads required.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_App-6631DB?style=for-the-badge&logo=githubpages&logoColor=white)](https://im-n10s.github.io/Ren-Py-RPA-Studio/)
[![RPA Support](https://img.shields.io/badge/RPA-3.0_%26_2.0-7B45F0?style=for-the-badge)](https://im-n10s.github.io/Ren-Py-RPA-Studio/)
[![Client-Side](https://img.shields.io/badge/100%25_Client--Side-Private_%26_Fast-491AB1?style=for-the-badge)](https://im-n10s.github.io/Ren-Py-RPA-Studio/)
[![Languages](https://img.shields.io/badge/UI-EN_%7C_AR_(RTL)-A981FF?style=for-the-badge)](https://im-n10s.github.io/Ren-Py-RPA-Studio/)

</div>

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| 🔒 **100% Private & Local** | All binary parsing, deobfuscation, and packaging run strictly inside your browser's memory. Nothing is ever uploaded to a server. |
| 📦 **Unpack `.rpa` Archives** | Full support for **RPA-3.0** and **RPA-2.0** formats (Python Pickle Protocols 0–5). Download individual files or export everything as a `.zip` with preserved folder structure. |
| 🗜️ **Pack to `.rpa`** | Drag and drop multiple files or entire folders to generate a valid **RPA-3.0** archive compatible with Ren'Py and `rpatool`. |
| 🌐 **Bilingual Interface** | Seamless switching between **English** and **Arabic (RTL)** with dedicated typography. |
| 🎨 **Liquid Glass UI** | Refined **Purple Haze** aesthetic with smooth Dark & Light theme switching and animated controls. |

---

## 🛠️ Tech Stack

- **Core:** Pure HTML5, CSS3, and Vanilla JavaScript (zero build step)
- **Compression:** [pako](https://github.com/nodeca/pako) (zlib inflate/deflate for the RPA index)
- **ZIP Export:** [JSZip](https://stuk.github.io/jszip/) (client-side `.zip` bundling)
- **Binary Engine:** Custom JavaScript Python Pickle parser (Protocols 0–5) & Protocol 2 serializer

---

## 💻 Run Locally

Clone the repository and open `index.html` directly in any modern browser:

```bash
git clone [https://github.com/im-n10s/Ren-Py-RPA-Studio.git](https://github.com/im-n10s/Ren-Py-RPA-Studio.git)
cd Ren-Py-RPA-Studio
```

---

## 💛 Support the Project

If **Ren'Py RPA Studio** helped your visual novel modding, translation, or development workflow, consider supporting its development via crypto:

- **Network:** BNB Smart Chain (`BEP-20`)
- **Wallet Address:**
  ```text
  0x6D6637cbea1618AeBc626Bb3eBFa623fD55639C1
  ```

---

<div align="center">

**Made with ❤️ by [n10s_exe](https://github.com/im-n10s)**

[![X (Twitter)](https://img.shields.io/badge/X-@n10s__exe-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/n10s_exe)
[![GitHub](https://img.shields.io/badge/GitHub-@im--n10s-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/im-n10s)

</div>