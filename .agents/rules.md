# Agent Rules

1. **Protocol Step 0**: Sebelum melakukan penelitian, analisis kode, atau perencanaan implementasi, agen WAJIB memeriksa isi direktori `.agents` dan membaca file `SKILL.md` atau tutorial/workflow yang relevan.
2. **Konfirmasi di Task Boundary**: Pembaruan `task_boundary` pertama untuk setiap tugas baru harus secara eksplit menyebutkan bahwa skill atau workflow dari `.agents` sedang ditinjau.
3. **Referensi di Rencana**: Setiap `implementation_plan.md` harus menyertakan bagian "Referenced Skills/Workflows" yang mencantumkan panduan dari folder `.agents` yang digunakan.
4. **Prioritas Pola Proyek**: Selalu prioritaskan pola arsitektur dan desain yang didokumentasikan di `.agents` dibandingkan dengan standar AI generik.
