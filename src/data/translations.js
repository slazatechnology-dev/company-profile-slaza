export const sections = ['about', 'services', 'portfolio', 'contact'];

export const translations = {
  id: {
    common: {
      newTab: "buka di tab baru"
    },
    nav: {
      about: "Tentang",
      services: "Layanan",
      portfolio: "Portofolio",
      contact: "Kontak",
      consultation: "Hubungi Kami",
      home: "Beranda",
      mainLabel: "Navigasi utama",
      mobileLabel: "Navigasi mobile",
      menuLabel: "Menu navigasi",
      langLabel: "Pilihan bahasa"
    },
    hero: {
      headline: "Aplikasi web dan perangkat IoT untuk operasional perusahaan",
      headlineAccent: "operasional perusahaan",
      shotAlt: "Halaman top up di yaytopup.id",
      shotCaption: "Tangkapan layar yaytopup.id, platform voucher digital buatan kami.",
      subtext: "Kami studio rekayasa di Malang. Tim yang sama menulis aplikasi web, backend, dan firmware perangkat, jadi data dari sensor sampai ke layar Anda tidak perlu berpindah tangan ke vendor lain.",
      ctaPrimary: "Ceritakan proyek Anda",
      ctaSecondary: "Lihat produk yang sudah berjalan"
    },
    about: {
      title: "Satu tim untuk software dan hardware",
      titleAccent: "software dan hardware",
      description: "PT. Slaza Technology Mandiri adalah studio rekayasa independen di Malang, Jawa Timur. Aplikasi web dan mobile, backend, dan perangkat keras IoT kami kerjakan dalam satu tim.",
      visionTitle: "Pendekatan Kami",
      visionText: "Kami menilai sebuah sistem dari dua hal: apakah sistem itu menyelesaikan masalah operasional klien, dan apakah tim klien masih bisa merawatnya bertahun-tahun kemudian.",
      missionTitle: "Komitmen Kerja",
      missions: [
        "Menulis kode yang modular dan teruji.",
        "Membangun perangkat IoT yang tetap bekerja di kondisi lapangan.",
        "Melaporkan kemajuan secara terbuka dan menepati tenggat proyek."
      ]
    },
    services: {
      title: "Yang kami kerjakan",
      titleAccent: "kami kerjakan",
      subtitle: "Satu proyek bisa memakai satu atau beberapa layanan di bawah ini. Kami ikut merawat sistemnya setelah berjalan di server produksi.",
      proofLabel: "Sudah berjalan di produksi:",
      items: [
        {
          id: "software",
          category: "Software Engineering",
          title: "Aplikasi Web, Mobile & Cloud Backend",
          desc: "Sistem web, API, dan aplikasi mobile untuk operasional bisnis.",
          features: [
            "REST & GraphQL API",
            "Aplikasi web front-end (Vue, React)",
            "Aplikasi mobile multi-platform",
            "Infrastruktur cloud & otomasi deployment"
          ]
        },
        {
          id: "iot",
          category: "IoT & Hardware",
          title: "Sistem Tertanam & Perangkat Keras IoT",
          desc: "Desain sistem perangkat keras berbasis mikrokontroler (ESP32, STM32), pengembangan firmware, dan integrasi sensor lapangan.",
          features: [
            "Firmware kustom (C/C++)",
            "Integrasi sensor industri & Modbus",
            "Komunikasi nirkabel (WiFi, BLE, seluler)",
            "Desain skematik & prototyping"
          ]
        },
        {
          id: "telemetry",
          category: "Data Streaming",
          title: "Telemetri Real-Time & Pemantauan Perangkat",
          desc: "Pengumpulan data dari armada perangkat lapangan dengan protokol ringan dan dasbor pemantauan operasional.",
          features: [
            "MQTT & WebSocket",
            "Manajemen perangkat jarak jauh",
            "Peringatan & notifikasi otomatis",
            "Dasbor data operasional"
          ]
        },
        {
          id: "consulting",
          category: "Konsultasi Teknis",
          title: "Audit Arsitektur & Modernisasi Sistem",
          desc: "Evaluasi sistem yang sedang berjalan, penanganan bottleneck performa, dan perencanaan peningkatan arsitektur.",
          features: [
            "Audit performa & bottleneck",
            "Evaluasi keamanan & struktur kode",
            "Perencanaan migrasi infrastruktur",
            "Konsultasi teknis pra-pengembangan"
          ]
        }
      ]
    },
    portfolio: {
      title: "Produk yang sudah berjalan",
      titleAccent: "sudah berjalan",
      subtitle: "Produk yang kami bangun dan operasikan sendiri.",
      projects: [
        {
          key: "yaytopup",
          title: "yaytopup.id",
          url: "https://yaytopup.id",
          imageId: "bundled:yaytopup",
          subtitle: "Platform Otomasi Distribusi Voucher & Produk Digital",
          desc: "Sistem transaksi untuk pembelian produk digital dan voucher game, terintegrasi langsung dengan payment gateway nasional dan provider eksternal, dengan penyelesaian transaksi otomatis.",
          techStack: ["Vue.js", "Payment Gateway", "Redis Queue"],
          urlText: "Kunjungi yaytopup.id",
          shotAlt: "Halaman top up koin di yaytopup.id",
          shotCaption: "Tangkapan layar yaytopup.id, 13 Oktober 2026."
        }
      ]
    },
    contact: {
      title: "Konsultasikan kebutuhan proyek Anda",
      titleAccent: "proyek Anda",
      subtitle: "Diskusikan rencana pengembangan aplikasi atau perangkat pintar bersama tim rekayasa kami.",
      form: {
        title: "Tulis pesan atau rencana proyek Anda",
        nameLabel: "Nama Lengkap",
        namePlaceholder: "Masukkan nama Anda",
        emailLabel: "Email Bisnis",
        emailPlaceholder: "nama@perusahaan.com",
        companyLabel: "Nama Perusahaan",
        companyPlaceholder: "Kosongkan jika perorangan",
        budgetLabel: "Perkiraan Anggaran",
        budgets: ["Belum tahu", "Di bawah Rp 25 juta", "Rp 25 juta sampai Rp 100 juta", "Di atas Rp 100 juta"],
        responsePromise: "Kami membalas dalam 1×24 jam kerja.",
        phoneLabel: "Nomor Telepon / WhatsApp",
        phonePlaceholder: "0812...",
        serviceLabel: "Layanan yang Dibutuhkan",
        services: [
          "Pengembangan Software (Web, Mobile, Cloud)",
          "Perangkat Keras IoT & Firmware",
          "Sistem Terintegrasi (Software + IoT)",
          "Konsultasi Arsitektur Sistem",
          "Lainnya"
        ],
        messageLabel: "Penjelasan Kebutuhan",
        messagePlaceholder: "Jelaskan ruang lingkup, gambaran proyek, atau target waktu yang Anda rencanakan...",
        submitBtn: "Kirim lewat WhatsApp",
        note: "Tombol ini membuka WhatsApp dengan pesan di atas sudah terisi. Halaman ini tidak menyimpan data Anda.",
        waIntro: "Halo PT. Slaza Technology Mandiri, saya ingin konsultasi proyek.",
        sentMsg: "WhatsApp dibuka di tab baru dengan pesan Anda. Tekan kirim di sana.",
        sentFallback: "Tidak terbuka? Buka WhatsApp di sini."
      },
      office: {
        title: "Kantor Operasional",
        addressLabel: "Alamat",
        address: "Assalam Residence Kav. 22, Desa Bakalan, Kecamatan Bululawang, Kabupaten Malang, Jawa Timur, 65171",
        emailLabel: "Email",
        email: "slazatechnology@gmail.com",
        phoneLabel: "WhatsApp / Telepon",
        phone: "+62 895-3710-64155",
        hoursLabel: "Jam Operasional",
        hours: "Senin - Jumat: 09:00 - 18:00 WIB",
        areaTitle: "Area Layanan",
        areaDesc: "Konsultasi tatap muka di wilayah Malang Raya. Klien di kota lain kami layani jarak jauh."
      }
    },
    footer: {
      desc: "PT. Slaza Technology Mandiri adalah studio rekayasa perangkat lunak dan sistem IoT di Malang, Jawa Timur.",
      quickLinks: "Menu",
      rights: "Seluruh Hak Cipta Dilindungi."
    }
  },
  en: {
    common: {
      newTab: "opens in a new tab"
    },
    nav: {
      about: "About",
      services: "Services",
      portfolio: "Work",
      contact: "Contact",
      consultation: "Get in Touch",
      home: "Home",
      mainLabel: "Main navigation",
      mobileLabel: "Mobile navigation",
      menuLabel: "Navigation menu",
      langLabel: "Language"
    },
    hero: {
      headline: "Web applications and IoT devices for company operations",
      headlineAccent: "company operations",
      shotAlt: "Top up page on yaytopup.id",
      shotCaption: "Screenshot of yaytopup.id, a digital voucher platform we built.",
      subtext: "We are an engineering studio in Malang, Indonesia. The same team writes the web app, the backend, and the device firmware, so data travels from sensor to screen without changing vendors.",
      ctaPrimary: "Tell us about your project",
      ctaSecondary: "See a product in production"
    },
    about: {
      title: "One team for software and hardware",
      titleAccent: "software and hardware",
      description: "PT. Slaza Technology Mandiri is an independent engineering studio in Malang, East Java. We build web and mobile apps, backends, and IoT hardware in one team.",
      visionTitle: "Our Approach",
      visionText: "We judge a system by two things: whether it solves the client's operational problem, and whether the client's team can still maintain it years later.",
      missionTitle: "Engineering Commitment",
      missions: [
        "Write modular, tested code.",
        "Build IoT hardware that keeps working in field conditions.",
        "Report progress openly and meet project deadlines."
      ]
    },
    services: {
      title: "What we build",
      titleAccent: "we build",
      subtitle: "A project can use one or several of the services below. We keep maintaining the system after it runs in production.",
      proofLabel: "Already running in production:",
      items: [
        {
          id: "software",
          category: "Software Engineering",
          title: "Web, Mobile & Cloud Platforms",
          desc: "Web applications, cloud backend APIs, and cross-platform mobile apps.",
          features: [
            "REST & GraphQL APIs",
            "Front-end web applications (Vue, React)",
            "Cross-platform mobile apps",
            "Cloud infrastructure & deployment automation"
          ]
        },
        {
          id: "iot",
          category: "IoT & Hardware",
          title: "Embedded Systems & IoT Hardware",
          desc: "Microcontroller system design (ESP32, STM32), custom firmware development, and industrial sensor integration.",
          features: [
            "Custom firmware (C/C++)",
            "Industrial sensor & Modbus integration",
            "Wireless connectivity (WiFi, BLE, cellular)",
            "Schematic design & prototyping"
          ]
        },
        {
          id: "telemetry",
          category: "Data Streaming",
          title: "Real-Time Telemetry & Device Monitoring",
          desc: "Data ingestion for fleets of field devices with lightweight protocols and monitoring dashboards.",
          features: [
            "MQTT & WebSocket",
            "Fleet management & remote diagnostics",
            "Automated alerts & webhooks",
            "Operational data dashboards"
          ]
        },
        {
          id: "consulting",
          category: "Technical Advisory",
          title: "Architecture Review & Modernization",
          desc: "Reviews of running systems, performance bottleneck fixes, and architecture upgrade planning.",
          features: [
            "Performance & bottleneck audits",
            "Code quality & security review",
            "Infrastructure migration planning",
            "Pre-development technical advisory"
          ]
        }
      ]
    },
    portfolio: {
      title: "Products already in production",
      titleAccent: "in production",
      subtitle: "Products we build and operate ourselves.",
      projects: [
        {
          key: "yaytopup",
          title: "yaytopup.id",
          url: "https://yaytopup.id",
          imageId: "bundled:yaytopup",
          subtitle: "Digital Voucher & Gaming Top-Up Platform",
          desc: "An automated transaction platform for gaming vouchers and digital credits, integrated with national payment gateways and external providers, with automatic settlement.",
          techStack: ["Vue.js", "Payment Gateway", "Redis Queue"],
          urlText: "Visit yaytopup.id",
          shotAlt: "Coin top-up page on yaytopup.id",
          shotCaption: "Screenshot of yaytopup.id, 13 October 2026."
        }
      ]
    },
    contact: {
      title: "Discuss your project",
      titleAccent: "your project",
      subtitle: "Talk to our engineering team about your software or connected hardware project.",
      form: {
        title: "Write your message or project plan",
        nameLabel: "Full Name",
        namePlaceholder: "Enter your full name",
        emailLabel: "Work Email",
        emailPlaceholder: "name@company.com",
        companyLabel: "Company Name",
        companyPlaceholder: "Leave empty if individual",
        budgetLabel: "Estimated Budget",
        budgets: ["Not sure yet", "Under IDR 25 million", "IDR 25 to 100 million", "Over IDR 100 million"],
        responsePromise: "We reply within 1 business day.",
        phoneLabel: "Phone / WhatsApp",
        phonePlaceholder: "+62 812...",
        serviceLabel: "Required Capability",
        services: [
          "Software Engineering (Web, Mobile, Cloud)",
          "IoT Hardware & Firmware",
          "Integrated Solutions (Software + IoT)",
          "Architecture Review & Consulting",
          "Other"
        ],
        messageLabel: "Project Details",
        messagePlaceholder: "Briefly outline your goals, timeline, or key technical requirements...",
        submitBtn: "Send via WhatsApp",
        note: "This button opens WhatsApp with the message above filled in. This page does not store your data.",
        waIntro: "Hello PT. Slaza Technology Mandiri, I would like to discuss a project.",
        sentMsg: "WhatsApp opened in a new tab with your message. Press send there.",
        sentFallback: "Did not open? Open WhatsApp here."
      },
      office: {
        title: "Office Location",
        addressLabel: "Address",
        address: "Assalam Residence Kav. 22, Bakalan Village, Bululawang District, Malang Regency, East Java, 65171",
        emailLabel: "Email",
        email: "slazatechnology@gmail.com",
        phoneLabel: "WhatsApp / Phone",
        phone: "+62 895-3710-64155",
        hoursLabel: "Office Hours",
        hours: "Monday - Friday: 09:00 - 18:00 WIB",
        areaTitle: "Service Area",
        areaDesc: "In-person meetings in the Malang area. Clients in other cities work with us remotely."
      }
    },
    footer: {
      desc: "PT. Slaza Technology Mandiri is an independent software and IoT engineering studio in Malang, East Java.",
      quickLinks: "Navigation",
      rights: "All Rights Reserved."
    }
  }
};
