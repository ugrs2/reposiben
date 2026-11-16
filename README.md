# Sıfır Tıklama

Yapay zekâ çağında haber sitelerinin trafik kaybını anlatan, three.js ile yapılmış
sinematik bir sunum. Video gibi kendi kendine oynar (yaklaşık 1 dk 38 sn). Her sahneye
tek tek de geçilebilir.

Sahnede **1.000 parçacık var ve her biri bir okur.** Aynı 1.000 okur sahneden sahneye
şekil değiştirerek hikâyeyi anlatıyor:

| # | Sahne | Ne oluyor |
|---|-------|-----------|
| 1 | Giriş | “Trafik nereye gitti?” Okurlardan oluşan bir haber galaksisi |
| 2 | Eskiden | Arama motorundan çıkan okur akışı 8 haber sitesine ulaşıyor |
| 3 | Yapay zekâ | Ortaya çıkan yapay zekâ çekirdeği akışı yutuyor, siteler sönüyor |
| 4 | 1.000 kişi | 1.000 kişilik ızgara, 990’ı yapay zekâya gidiyor, **10 kişi** kaynağa tıklıyor (%1) |
| 5 | Dünya | Okurlardan oluşan küre, ışıkların yarısı sönüyor: **−%50** |
| 6 | Türkiye | Türkiye haritası, okurların %80’i kırmızıya dönüp düşüyor: **−%80** |
| 7 | Eğilim | Dünya ve Türkiye eğrileri “bugün”den sonra da düşmeye devam ediyor |
| 8 | Çıkış yolu | Doğrudan bağ, kopyalanamaz içerik, sadakate dayalı gelir, içerik hakkı |
| 9 | Son | “Tıklama ekonomisi bitiyor. Okur ekonomisi başlıyor.” Kaynaklar |

Sayaçlar (1.000 → 10, %0 → −%50, %0 → −%80) ekrandaki parçacıklardan sayılır. Yani
rakam ile görüntü her karede birebir örtüşür.

## Çalıştırma

`index.html` dosyasını tarayıcıda açmanız yeterli. three.js (`vendor/`) ve yazı
tipleri (`fonts/`, SIL Open Font License) repoda olduğu için sunum internetsiz de
çalışır.

Yerel sunucu isterseniz:

```bash
npm start            # http://localhost:5173
```

### Kısayollar

| Tuş | İşlev |
|-----|-------|
| Boşluk / K / tıklama | Oynat / duraklat |
| → / PageDown | Sonraki sahne (sunum kumandalarıyla da çalışır) |
| ← / PageUp | Sahnenin başı / önceki sahne |
| 1–9 | Doğrudan sahneye git |
| F | Tam ekran |
| M | Sesi aç/kapat |
| Home | Baştan başlat |

Belirli bir sahneden açmak için adresin sonuna sahne kimliğini ekleyin:
`index.html#turkiye`. Kimlikler: `giris`, `eskiden`, `yapay-zeka`, `bin-kisi`,
`dunya`, `turkiye`, `egilim`, `cikis`, `son`.

Ses, tarayıcıda Web Audio ile üretilir (alçak bir uğultu ve sahne geçişlerinde vuruşlar).
“Sunumu başlat” düğmesine basınca başlar.

## Videoya dönüştürme

Sunumun zaman çizelgesi deterministik. `tools/record.mjs` her kareyi tek tek render
edip ffmpeg ile MP4’e çevirir. Makine yavaş olsa da video akıcı çıkar.

```bash
npm install
npm run record                                              # 1920x1080, 30 fps
node tools/record.mjs --fps 60 --out video/60fps.mp4
node tools/record.mjs --width 3840 --height 2160 --out video/4k.mp4
node tools/record.mjs --from 51 --to 63 --out video/turkiye.mp4   # tek bölüm (saniye)
```

ffmpeg PATH’te değilse konumunu `FFMPEG=/yol/ffmpeg` ile verin. Video sessiz
üretilir; müzik veya seslendirmeyi montajda eklemeniz gerekir.

## Metni ve rakamları düzenleme

- **Metinler:** `index.html` içindeki `<section class="scene">` blokları.
  `data-in` / `data-out`, metnin sahne içinde kaçıncı saniyede girip çıkacağını belirler.
- **Sahne süreleri:** script içindeki `SCENES` dizisi.
- **Oranlar:** `layout()` fonksiyonunda `rk < 500` (dünya %50) ve `rk < 800`
  (Türkiye %80) eşikleri ile tıklayan 10 kişi için `rk < 10`.

## Kaynaklar ve notlar

- **%1 tıklama oranı:** Pew Research Center, *Google users are less likely to click on
  links when an AI summary appears in the results* (Temmuz 2025). AI özeti gösterilen
  aramalarda, özetin içindeki kaynağa tıklama ziyaretlerin %1’inde gerçekleşti.
- **Türkiye (%80’e varan) ve dünya geneli (%50) düşüş oranları:** sunum brifindeki
  yayıncı verileri. Sunumda kaynak belirtmeden önce kendi verilerinizle doğrulayın.
- **Eğilim grafiği** temsilidir. Başlangıç (100) ve bugünkü değerler (50 / 20) yukarıdaki
  oranlara dayanır, ara değerler ve projeksiyon gösterim amaçlıdır.
