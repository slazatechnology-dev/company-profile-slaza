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
      headline: "Rekayasa Perangkat Lunak & Sistem IoT Terpadu",
      subtext: "PT. Slaza Technology Mandiri merancang dan membangun aplikasi web, backend cloud, dan perangkat keras IoT untuk operasional perusahaan Anda.",
      ctaPrimary: "Mulai Konsultasi Proyek",
      ctaSecondary: "Lihat Portofolio"
    },
    about: {
      title: "Menghubungkan Solusi Digital dengan Dunia Fisik & Lapangan",
      description: "Kami studio rekayasa teknologi independen di Jakarta. Kami mengerjakan aplikasi web dan mobile bersama perancangan perangkat keras IoT dalam satu tim.",
      visionTitle: "Pendekatan Kami",
      visionText: "Kami menilai sebuah sistem dari dua hal: apakah sistem itu menyelesaikan masalah operasional klien, dan apakah tim klien masih bisa merawatnya bertahun-tahun kemudian.",
      missionTitle: "Komitmen Kerja",
      missions: [
        "Menulis kode yang modular dan teruji.",
        "Membangun perangkat IoT yang tetap bekerja di kondisi lapangan.",
        "Melaporkan kemajuan secara terbuka dan menepati tenggat proyek."
      ],
      pillarsTitle: "Fondasi Rekayasa",
      pillars: [
        {
          title: "Arsitektur Modular",
          desc: "Struktur kode yang mudah dikembangkan dan dirawat tanpa ketergantungan berlebih."
        },
        {
          title: "Hardware-to-Cloud",
          desc: "Aliran data yang konsisten dari mikrokontroler sensor langsung ke server aplikasi."
        },
        {
          title: "Kinerja & Reliabilitas",
          desc: "Optimasi sistem backend dan query basis data untuk menangani volume transaksi tinggi."
        },
        {
          title: "Pengujian Nyata",
          desc: "Uji beban dan verifikasi lapangan sebelum sistem dioperasikan di lingkungan produksi."
        }
      ]
    },
    services: {
      title: "Kapabilitas Teknis & Layanan Rekayasa Terintegrasi",
      subtitle: "Kami mendampingi Anda dari tahap perancangan arsitektur, implementasi kode, hingga peluncuran sistem di server produksi.",
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
      title: "Produk Nyata di Lapangan",
      subtitle: "Karya yang kami rancang, bangun, dan operasikan sendiri.",
      project: {
        title: "yaytopup.id",
        subtitle: "Platform Otomasi Distribusi Voucher & Produk Digital",
        desc: "Sistem transaksi untuk pembelian produk digital dan voucher game, terintegrasi langsung dengan payment gateway nasional dan provider eksternal, dengan penyelesaian transaksi otomatis.",
        techStack: ["Vue.js", "High-Concurrency Backend", "Payment Gateway", "Redis Queue"],
        urlText: "Kunjungi yaytopup.id",
        shotAlt: "Halaman top up koin di yaytopup.id",
        shotCaption: "Tangkapan layar yaytopup.id, 13 Oktober 2026."
      },
      upcomingTitle: "Riset & Pengembangan IoT",
      upcomingDesc: "Prototipe perangkat keras dan telemetri yang sedang kami kembangkan di lab internal.",
      upcomingItems: [
        {
          tag: "Hardware Gateway",
          title: "Slaza Telemetry Core Unit",
          desc: "Modul gateway sensor industri dengan dukungan transmisi seluler dan penyimpanan lokal aman saat jaringan terputus.",
          specs: "ESP32-S3 Core • RS485 Modbus • MQTT TLS"
        },
        {
          tag: "Smart Monitoring",
          title: "Power Telemetry Hub",
          desc: "Modul pemantauan daya listrik dan konsumsi mesin industri untuk deteksi dini pemakaian abnormal.",
          specs: "Current Transformer Sensors • Real-time Ingestion"
        }
      ]
    },
    contact: {
      title: "Konsultasikan Kebutuhan Proyek Anda",
      subtitle: "Diskusikan rencana pengembangan aplikasi atau perangkat pintar bersama tim rekayasa kami.",
      form: {
        title: "Tulis pesan atau rencana proyek Anda",
        nameLabel: "Nama Lengkap",
        namePlaceholder: "Masukkan nama Anda",
        emailLabel: "Email Bisnis",
        emailPlaceholder: "nama@perusahaan.com",
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
        areaDesc: "Melayani konsultasi langsung di wilayah Jabodetabek serta kerja sama jarak jauh (remote engineering) untuk seluruh Indonesia dan regional."
      }
    },
    footer: {
      desc: "PT. Slaza Technology Mandiri adalah studio rekayasa perangkat lunak dan integrasi sistem IoT di Jakarta.",
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
      headline: "Software Engineering & Connected IoT Systems",
      subtext: "PT. Slaza Technology Mandiri designs and builds web applications, cloud backends, and industrial IoT hardware.",
      ctaPrimary: "Start Project Discussion",
      ctaSecondary: "View Work"
    },
    about: {
      title: "Bridging Digital Software and Physical Field Operations",
      description: "We are an independent engineering studio in Jakarta. We build web and mobile applications and design custom IoT hardware in one team.",
      visionTitle: "Our Approach",
      visionText: "We judge a system by two things: whether it solves the client's operational problem, and whether the client's team can still maintain it years later.",
      missionTitle: "Engineering Commitment",
      missions: [
        "Write modular, tested code.",
        "Build IoT hardware that keeps working in field conditions.",
        "Report progress openly and meet project deadlines."
      ],
      pillarsTitle: "Core Foundations",
      pillars: [
        {
          title: "Modular Architecture",
          desc: "Code structured so it is easy to extend and maintain, without unnecessary dependencies."
        },
        {
          title: "Hardware-to-Cloud",
          desc: "Consistent data flow from sensor microcontrollers straight to the application server."
        },
        {
          title: "Performance & Reliability",
          desc: "Backend and database query optimization for high transaction volumes."
        },
        {
          title: "Field Testing",
          desc: "Load testing and field verification before a system goes into production."
        }
      ]
    },
    services: {
      title: "Technical Capabilities & Engineering Services",
      subtitle: "We work with you through architecture design, implementation, and deployment to production.",
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
      title: "Real Systems in Production",
      subtitle: "Work we designed, built, and operate ourselves.",
      project: {
        title: "yaytopup.id",
        subtitle: "Digital Voucher & Gaming Top-Up Platform",
        desc: "An automated transaction platform for gaming vouchers and digital credits, integrated with national payment gateways and external providers, with automatic settlement.",
        techStack: ["Vue.js", "High-Concurrency Backend", "Payment Gateway", "Redis Queue"],
        urlText: "Visit yaytopup.id",
        shotAlt: "Coin top-up page on yaytopup.id",
        shotCaption: "Screenshot of yaytopup.id, 13 October 2026."
      },
      upcomingTitle: "IoT R&D Prototypes",
      upcomingDesc: "Hardware and telemetry prototypes we are developing in our internal lab.",
      upcomingItems: [
        {
          tag: "Hardware Gateway",
          title: "Slaza Telemetry Core Unit",
          desc: "Industrial sensor gateway unit supporting cellular connectivity and fail-safe local storage.",
          specs: "ESP32-S3 Core • RS485 Modbus • MQTT TLS"
        },
        {
          tag: "Smart Monitoring",
          title: "Power Telemetry Hub",
          desc: "Multi-phase power consumption telemetry hub for early industrial machinery anomaly detection.",
          specs: "Current Transformer Sensors • Real-time Ingestion"
        }
      ]
    },
    contact: {
      title: "Discuss Your Project",
      subtitle: "Talk to our engineering team about your software or connected hardware project.",
      form: {
        title: "Write your message or project plan",
        nameLabel: "Full Name",
        namePlaceholder: "Enter your full name",
        emailLabel: "Work Email",
        emailPlaceholder: "name@company.com",
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
        areaDesc: "In-person consultation across Greater Jakarta (Jabodetabek), and remote engineering work for clients across Indonesia and the region."
      }
    },
    footer: {
      desc: "PT. Slaza Technology Mandiri is an independent software and IoT engineering studio based in Jakarta.",
      quickLinks: "Navigation",
      rights: "All Rights Reserved."
    }
  }
};
