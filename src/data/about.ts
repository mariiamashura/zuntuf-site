// Текст раздела «Про автора» — из профиля github.com/mariiamashura
type L = 'en' | 'de' | 'ua';
type Block = { title: string; paras?: string[]; items?: string[] };
type Group = { title?: string; blocks: Block[] };

export const about: Record<L, { sections: Block[]; focus: Block[]; focusTitle: string; tools: Block[]; toolsTitle: string; connect: Block; star: string }> = {
  en: {
    sections: [
      {
        title: 'About me',
        paras: [
          "I'm a graphic designer and artist from Kyiv, Ukraine, and the visual side always comes first for me: composition, color, style, and attention to detail.",
          "I'm also fascinated by development. I'm not a programmer by profession, but an enthusiast: with the help of AI tools I build software, test ideas, and bring them to a working state. My strength is that I can see what the result should look like, set clear tasks, and make decisions, while technology helps me get there faster.",
          "I'm drawn to the role of the person who holds the whole picture: the idea, the look, the logic, and the outcome. That's why I'm growing toward project and product management.",
        ],
      },
      {
        title: 'Principles',
        items: [
          'Aesthetics matter. A good product is both beautiful and easy to use.',
          'A clear goal. First what and why, then how.',
          "Results. An idea is only valuable once it's finished.",
          'Constant learning. Every task opens up something new.',
          'Openness. I love sharing knowledge and learning from others.',
        ],
      },
    ],
    focusTitle: 'Focus, learning, goals',
    focus: [
      { title: 'Working on', items: ['Graphics, illustrations, visual concepts', 'Building software and tools with AI assistants and agents', 'Automating routine work', 'Experimenting with new technologies'] },
      { title: 'Learning', items: ['Project and product management', 'AI agents and task setting (prompt engineering)', 'Development basics and Git'] },
      { title: 'Goals', items: ['Combine design, art, and technology in my own products', 'Build a portfolio of finished works', 'Gain experience managing projects and teams', 'Share what I learn'] },
    ],
    toolsTitle: 'Tools',
    tools: [
      { title: 'Design and creativity', items: ['Photoshop', 'Illustrator'] },
      { title: 'AI-assisted development', items: ['Claude'] },
    ],
    connect: {
      title: "Let's connect",
      paras: ['Open to a collaboration or commission, a project idea, or just a chat about design, art, and technology.'],
    },
    star: 'If you liked my work, give it a star. It’s very motivating!',
  },
  de: {
    sections: [
      {
        title: 'Über mich',
        paras: [
          'Ich bin Grafikdesigner und Künstler aus Kyjiw in der Ukraine, und die visuelle Seite steht für mich immer an erster Stelle: Komposition, Farbe, Stil und Liebe zum Detail.',
          'Auch die Entwicklung fasziniert mich. Ich bin kein Programmierer von Beruf, sondern ein Enthusiast: Mit Hilfe von KI-Werkzeugen baue ich Software, probiere Ideen aus und bringe sie zum Laufen. Meine Stärke ist, dass ich sehe, wie das Ergebnis aussehen soll, klare Aufgaben stelle und Entscheidungen treffe, während die Technik mir hilft, schneller ans Ziel zu kommen.',
          'Mich zieht die Rolle des Menschen an, der das ganze Bild im Blick hat: die Idee, das Aussehen, die Logik und das Ergebnis. Deshalb entwickle ich mich in Richtung Projekt- und Produktmanagement.',
        ],
      },
      {
        title: 'Prinzipien',
        items: [
          'Ästhetik zählt. Ein gutes Produkt ist schön und zugleich einfach zu benutzen.',
          'Ein klares Ziel. Erst was und warum, dann wie.',
          'Ergebnisse. Eine Idee ist erst wertvoll, wenn sie fertig ist.',
          'Ständiges Lernen. Jede Aufgabe eröffnet etwas Neues.',
          'Offenheit. Ich teile gern Wissen und lerne von anderen.',
        ],
      },
    ],
    focusTitle: 'Fokus, Lernen, Ziele',
    focus: [
      { title: 'Woran ich arbeite', items: ['Grafik, Illustrationen, visuelle Konzepte', 'Software und Werkzeuge mit KI-Assistenten und Agenten bauen', 'Routinearbeit automatisieren', 'Mit neuen Technologien experimentieren'] },
      { title: 'Was ich lerne', items: ['Projekt- und Produktmanagement', 'KI-Agenten und Aufgabenstellung (Prompt Engineering)', 'Grundlagen der Entwicklung und Git'] },
      { title: 'Ziele', items: ['Design, Kunst und Technik in eigenen Produkten verbinden', 'Ein Portfolio fertiger Arbeiten aufbauen', 'Erfahrung in der Leitung von Projekten und Teams sammeln', 'Weitergeben, was ich lerne'] },
    ],
    toolsTitle: 'Werkzeuge',
    tools: [
      { title: 'Design und Kreativität', items: ['Photoshop', 'Illustrator'] },
      { title: 'KI-gestützte Entwicklung', items: ['Claude'] },
    ],
    connect: {
      title: 'Kontakt',
      paras: ['Offen für Zusammenarbeit oder Aufträge, eine Projektidee oder einfach ein Gespräch über Design, Kunst und Technologie.'],
    },
    star: 'Wenn Ihnen meine Arbeit gefällt, geben Sie einen Stern. Das motiviert sehr!',
  },
  ua: {
    sections: [
      {
        title: 'Про мене',
        paras: [
          'Я графічний дизайнер і художник з Києва, Україна, і візуальна сторона для мене завжди на першому місці: композиція, колір, стиль і увага до деталей.',
          'Розробка теж стала моїм захопленням. Я не програміст за фахом, а ентузіаст: за допомогою ШІ-інструментів я створюю програми, перевіряю ідеї й доводжу їх до робочого стану. Моя сила в тому, що я бачу, яким має бути результат, ставлю чіткі завдання й ухвалюю рішення, а технології допомагають дійти до цього швидше.',
          'Мене приваблює роль, яка тримає цілісну картину: ідею, вигляд, логіку й результат. Тому я розвиваюся в напрямі управління проєктами та продуктами.',
        ],
      },
      {
        title: 'Принципи',
        items: [
          'Естетика важлива. Добрий продукт водночас гарний і зручний.',
          'Чітка мета. Спершу що й навіщо, потім як.',
          'Результат. Ідея має цінність, лише коли доведена до кінця.',
          'Постійне навчання. Кожне завдання відкриває щось нове.',
          'Відкритість. Я люблю ділитися знаннями й вчитися в інших.',
        ],
      },
    ],
    focusTitle: 'Фокус, навчання, цілі',
    focus: [
      { title: 'Над чим працюю', items: ['Графіка, ілюстрації, візуальні концепції', 'Створення програм та інструментів за допомогою ШІ-асистентів і агентів', 'Автоматизація рутинної роботи', 'Експерименти з новими технологіями'] },
      { title: 'Що вивчаю', items: ['Управління проєктами та продуктами', 'ШІ-агенти й постановка завдань (prompt engineering)', 'Основи розробки та Git'] },
      { title: 'Цілі', items: ['Поєднувати дизайн, мистецтво й технології у власних продуктах', 'Зібрати портфоліо завершених робіт', 'Здобути досвід керування проєктами й командами', 'Ділитися тим, чого навчаюся'] },
    ],
    toolsTitle: 'Інструменти',
    tools: [
      { title: 'Дизайн і творчість', items: ['Photoshop', 'Illustrator'] },
      { title: 'Розробка з підтримкою ШІ', items: ['Claude'] },
    ],
    connect: {
      title: 'Давайте зв’яжемося',
      paras: ['Відкритий до співпраці чи замовлення, ідеї проєкту або просто розмови про дизайн, мистецтво й технології.'],
    },
    star: 'Якщо вам сподобалась моя робота, поставте зірку. Це дуже мотивує!',
  },
};
