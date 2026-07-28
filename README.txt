SunObs Mobile v1.8 — ASAL + PILIHAN NEGERI

Versi ini dibina terus daripada PWA asal SunObs Mobile v1.2.
Antaramuka, susunan Set 1/Set 2 dan aliran penggunaan asal dikekalkan.

Perubahan sahaja:
- Pilihan negeri dipaparkan terus dalam HTML, bukan dijana oleh JavaScript.
- Stesen origin, latitud origin dan longitud origin GDM2000 dipaparkan automatik.
- Latitud origin negeri menggantikan nilai tetap Pahang dalam formula asal.
- Longitud origin ialah rujukan sahaja dan tidak masuk formula.
- Rekod tersimpan turut menyimpan negeri.

Formula lain tidak diubah daripada PWA asal yang diselaraskan dengan Excel v2.3D.
Cache: sunobs-mobile-v1-8-asal-tambah-negeri


Versi 1.9: Susun atur jadual mudah alih dikemas; tiada perubahan pada enjin kiraan.


Versi 1.10
- Kotak tarikh dikecilkan pada paparan telefon.
- Kolum Waktu dikecilkan dan menggunakan input teks HH:MM:SS supaya tidak dipaksa lebar oleh Safari iOS.
- Kolum Mengufuk dan Pugak diberi ruang seimbang serta jurang 4px.
- Enjin kiraan tidak diubah.

Versi 1.12B
- Dibina semula daripada v1.11 yang berfungsi.
- Hanya input waktu ditukar kepada type=time, step=60, HH:MM.
- Medan mengufuk, pugak dan T.R. kekal boleh diedit.
- Enjin kiraan tidak diubah.

Versi 1.12C
- Kotak waktu kekal native type=time.
- Nilai dan paparan HH:MM sahaja.
- Semua nilai contoh bersaat dibuang.
- Medan Mengufuk, Pugak dan T.R. tidak diubah.

Versi 1.12E
- Nilai dalam kotak Waktu dipusatkan.
- Header Sasaran dikecilkan dan dipusatkan.
- Enjin kiraan dan input lain tidak diubah.

Versi 1.12F
- Buang -webkit-appearance:none yang merosakkan input time iPhone.
- Pulihkan input time native Safari.
- Kolum Sasaran dibesarkan kepada 20%.
- Kolum Waktu 17%; Mengufuk/Pugak 31.5% setiap satu.
- Enjin dan HTML input tidak diubah.


v1.13.1
- Pembetulan lajur Waktu Android tidak berkesan (teknik @supports tak boleh dipercayai penuh pada sesetengah Chrome Android).
- Ditukar kepada pengesanan Android terus melalui JavaScript (class "is-android" pada <html>), lebih tepat.
- Tiada perubahan pada enjin kiraan atau paparan iPhone.

v1.13.0
- Bug: hasil kiraan lapuk (stale) yang boleh disimpan walaupun input berubah — dibetulkan.
- Bug: service worker tidak kesan kemaskini versi — dibetulkan (banner "Muat Semula" kini muncul).
- Rekod tersimpan kini simpan bacaan penuh (bukan ringkasan) + boleh dimuat semula ke borang.
- Eksport CSV bagi semua rekod tersimpan.
- Validasi masa nyata bagi bacaan sudut (sempadan merah serta-merta jika format salah).
- Mesej jelas jika coefficients.json gagal dimuatkan (contoh: tiada internet semasa pemasangan pertama).
- Enjin kiraan, senarai negeri/origin, dan semua pembetulan iOS/Safari sebelumnya TIDAK diubah.

v2.0.0 — Kemas kini rupa & ciri
- Tema Gelap/Terang (butang di header, ikut pilihan sistem secara automatik pada lawatan pertama, kemudian ingat pilihan pengguna).
- Carta Trend Ketepatan: paparkan Beza Set (″) bagi 12 rekod terkini dengan garis had 30″.
- Carian & susun Rekod Tersimpan (ikut stesen/TR/negeri/tarikh, terkini/terlama dahulu).
- Notifikasi toast (bukan alert()) untuk simpan, padam dan eksport CSV.
- Animasi halus pada kad, keputusan dan butang.
- Enjin kiraan, senarai negeri/origin, dan SEMUA pembetulan iOS/Safari/Android sebelumnya TIDAK diubah.

v2.0.1 — Pembetulan kontras tema gelap
- Teks lajur Sasaran (TR Awal/P.Ki/P.Ka/TR Akhir) kini terang & jelas dalam mod gelap.
- Highlight bacaan tidak sah (invalid) kini betul dalam kedua-dua tema.
