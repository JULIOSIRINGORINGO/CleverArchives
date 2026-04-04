# Clever Archives - Development Rules

1. **Maintain Consistency**: When updating the codebase, never break existing logic, established workflows, or the intended application flow.
2. **Performance First**: Prioritize efficient data fetching. Use caching mechanisms (like SWR) to show existing data immediately while performing background updates.
3. **Incremental Updates**: Avoid full-page data refetches when only partial updates or new data additions are required.
4. **Protocol Step 0**: Sebelum melakukan penelitian, analisis kode, atau perencanaan implementasi, agen WAJIB memeriksa isi direktori `.agents` dan membaca file `SKILL.md` atau tutorial/workflow yang relevan.
5. **Konfirmasi di Task Boundary**: Pembaruan `task_boundary` pertama untuk setiap tugas baru harus secara eksplit menyebutkan bahwa skill atau workflow dari `.agents` sedang ditinjau.
6. **Referensi di Rencana**: Setiap `implementation_plan.md` harus menyertakan bagian "Referenced Skills/Workflows" yang mencantumkan panduan dari folder `.agents` yang digunakan.
7. **Prioritas Pola Proyek**: Selalu prioritaskan pola arsitektur dan desain yang didokumentasikan di `.agents` dibandingkan dengan standar AI generik.
