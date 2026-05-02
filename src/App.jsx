import React, { useMemo, useState } from "react";

const Icon = ({ label, size = "normal" }) => {
  const sizes = {
    small: "h-5 w-5 text-xs",
    normal: "h-8 w-8 text-sm",
    large: "h-10 w-10 text-base"
  };
  return (
    <span className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-2xl bg-slate-900 font-black text-white`}>
      {label}
    </span>
  );
};

const StatusIcon = ({ ok }) => (
  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-black ${ok ? "bg-emerald-700 text-white" : "bg-rose-700 text-white"}`}>
    {ok ? "✓" : "×"}
  </span>
);

const modules = [
  {
    id: "intro",
    title: "1. Introducción al ensamblador",
    short: "Qué es y por qué se usa",
    icon: "I",
    summary:
      "El procesador entiende lenguaje de máquina. El ensamblador es una forma legible de escribir instrucciones cercanas al hardware. NASM traduce esas instrucciones a código objeto, y luego el linker genera el ejecutable.",
    keyPoints: [
      "El ensamblador depende de la arquitectura del procesador.",
      "En este curso se trabaja con x86-64 y sintaxis Intel/NASM.",
      "Una instrucción de ensamblador suele traducirse de forma directa a máquina.",
      "Aprender ensamblador ayuda a entender registros, memoria, llamadas a funciones y entrada/salida."
    ],
    example: `section .text\nglobal _start\n\n_start:\n    mov rax, 60\n    mov rdi, 0\n    syscall`,
    explanation: [
      "rax = 60 indica el syscall exit en Linux x86-64.",
      "rdi = 0 indica código de salida exitoso.",
      "syscall solicita al sistema operativo ejecutar la acción."
    ],
    pitfall: "Pensar que mov ejecuta una acción del sistema. mov solo copia datos; la acción ocurre con syscall."
  },
  {
    id: "registros",
    title: "2. Arquitectura x86-64 y registros",
    short: "rax, rsp, rbp, rip y tamaños",
    icon: "R",
    summary:
      "x86-64 tiene registros generales de 64 bits. Se puede acceder a partes más pequeñas del mismo registro: rax, eax, ax, al y ah. Algunos registros tienen usos frecuentes, como rsp para la pila, rbp para la base del marco y rax para retornos.",
    keyPoints: [
      "rax, rbx, rcx, rdx, rsi, rdi, rsp y rbp son registros de 64 bits.",
      "eax representa los 32 bits bajos de rax.",
      "ax representa los 16 bits bajos de rax.",
      "al representa los 8 bits bajos de rax.",
      "Escribir en eax limpia los 32 bits superiores de rax.",
      "rsp no debe usarse como registro general porque controla la pila."
    ],
    example: `mov rax, 0x1122334455667788\nmov ax, 0xAAAA\n; rax queda: 0x112233445566AAAA`,
    explanation: [
      "ax solo modifica los 16 bits menos significativos.",
      "El resto de rax permanece igual.",
      "Si se usara eax, los 32 bits superiores se pondrían en cero."
    ],
    pitfall: "Confundir rax, eax, ax y al como si fueran registros independientes. Son vistas parciales del mismo registro."
  },
  {
    id: "formato",
    title: "3. Formato de programa NASM",
    short: ".data, .bss y .text",
    icon: "F",
    summary:
      "Un programa NASM se organiza en secciones. .data contiene variables inicializadas y constantes. .bss reserva memoria sin inicializar. .text contiene las instrucciones ejecutables.",
    keyPoints: [
      ".data: datos inicializados, como mensajes, números y constantes.",
      ".bss: espacios reservados sin valor inicial.",
      ".text: código ejecutable.",
      "db, dw, dd y dq definen datos de 8, 16, 32 y 64 bits.",
      "resb, resw, resd y resq reservan memoria en .bss."
    ],
    example: `section .data\n    msg db "Hola", 10\n    msg_len equ $ - msg\n\nsection .bss\n    buffer resb 20\n\nsection .text\nglobal _start`,
    explanation: [
      "msg guarda bytes inicializados.",
      "msg_len calcula el tamaño del mensaje.",
      "buffer reserva 20 bytes sin inicializarlos."
    ],
    pitfall: "Usar db en .bss para reservar espacio. En .bss se usa resb, resw, resd o resq."
  },
  {
    id: "aritmetica",
    title: "4. Operaciones aritméticas enteras",
    short: "add, sub, inc, dec, mul, imul, div, idiv",
    icon: "A",
    summary:
      "Las instrucciones aritméticas permiten sumar, restar, multiplicar y dividir enteros. add y sub usan destino y fuente. mul, imul, div e idiv tienen reglas especiales y usan registros como rax y rdx.",
    keyPoints: [
      "add dest, src suma y guarda el resultado en dest.",
      "sub dest, src resta src a dest y guarda en dest.",
      "inc aumenta en 1; dec disminuye en 1.",
      "mul trabaja sin signo y usa rax como operando implícito.",
      "imul trabaja con signo y tiene varias formas.",
      "div guarda el cociente en rax y el residuo en rdx para división de 64 bits."
    ],
    example: `mov rax, 10\nmov rbx, 3\nadd rax, rbx\n; rax = 13`,
    explanation: [
      "rax inicia con 10.",
      "rbx inicia con 3.",
      "add rax, rbx guarda 10 + 3 en rax."
    ],
    pitfall: "Intentar hacer operaciones con dos accesos a memoria, por ejemplo add [a], [b]. En x86 normalmente no se permiten dos operandos de memoria."
  },
  {
    id: "logicas",
    title: "5. Operaciones lógicas y bits",
    short: "and, or, xor, not, shl, shr, sar, rol, ror",
    icon: "L",
    summary:
      "Las instrucciones lógicas trabajan bit por bit. Se usan para máscaras, banderas, limpiar registros, revisar paridad, multiplicar o dividir por potencias de dos y manipular campos dentro de un valor binario.",
    keyPoints: [
      "and sirve para conservar ciertos bits y limpiar otros.",
      "or sirve para activar bits.",
      "xor sirve para comparar diferencias o poner un registro en cero con xor reg, reg.",
      "not invierte todos los bits.",
      "shl desplaza a la izquierda y rellena con ceros.",
      "shr desplaza a la derecha sin signo.",
      "sar desplaza a la derecha preservando el signo.",
      "rol y ror rotan bits."
    ],
    example: `mov al, 10101100b\nand al, 00001111b\n; al = 00001100b`,
    explanation: [
      "La máscara 00001111b conserva los 4 bits bajos.",
      "Los 4 bits altos se limpian a cero.",
      "Esto sirve para extraer campos pequeños dentro de un byte."
    ],
    pitfall: "Usar shr para números con signo negativos cuando se quiere conservar el signo. Para eso normalmente se usa sar."
  },
  {
    id: "saltos",
    title: "6. Comparaciones, saltos y ciclos",
    short: "cmp, jmp, je, jne, jl, jg, loop",
    icon: "J",
    summary:
      "En ensamblador no hay if, else ni while como en C. Se construyen con etiquetas, comparaciones y saltos. cmp actualiza banderas; los saltos condicionales revisan esas banderas.",
    keyPoints: [
      "jmp salta siempre a una etiqueta.",
      "cmp op1, op2 compara internamente como op1 - op2 y actualiza banderas.",
      "je salta si son iguales.",
      "jne salta si son diferentes.",
      "jl, jle, jg y jge se usan para comparaciones con signo.",
      "jb, jbe, ja y jae se usan para comparaciones sin signo.",
      "loop decrementa rcx y salta si rcx no llega a cero."
    ],
    example: `mov rcx, 5\n\nrepetir:\n    ; cuerpo del ciclo\n    loop repetir`,
    explanation: [
      "rcx funciona como contador.",
      "loop resta 1 a rcx.",
      "Si rcx no es 0, vuelve a la etiqueta repetir."
    ],
    pitfall: "Usar jl o jg para valores sin signo. Para valores sin signo deben usarse jb, ja, jbe o jae."
  },
  {
    id: "input",
    title: "7. Entrada de datos con syscall",
    short: "read desde STDIN",
    icon: "E",
    summary:
      "La entrada de datos en Linux x86-64 puede hacerse con el syscall read. Este lee caracteres desde una fuente, como la entrada estándar, y los guarda en una dirección de memoria.",
    keyPoints: [
      "rax = 0 indica syscall read.",
      "rdi = 0 indica STDIN.",
      "rsi contiene la dirección del buffer.",
      "rdx contiene la cantidad máxima de bytes a leer.",
      "El valor retornado en rax suele ser la cantidad de bytes leídos."
    ],
    example: `section .bss\n    buffer resb 20\n\nsection .text\n    mov rax, 0\n    mov rdi, 0\n    mov rsi, buffer\n    mov rdx, 20\n    syscall`,
    explanation: [
      "Se reserva un buffer de 20 bytes.",
      "read intenta leer hasta 20 bytes desde teclado.",
      "Los caracteres quedan almacenados en buffer."
    ],
    pitfall: "Olvidar reservar espacio suficiente para la entrada. Si lees más bytes de los reservados, puedes sobrescribir memoria."
  },
  {
    id: "pila",
    title: "8. Pila y funciones",
    short: "push, pop, call, ret, rsp, rbp",
    icon: "P",
    summary:
      "La pila es una estructura LIFO: lo último que entra es lo primero que sale. En x86-64 crece hacia direcciones menores. rsp apunta al tope. call guarda la dirección de retorno en la pila y ret la recupera.",
    keyPoints: [
      "push reduce rsp en 8 y guarda un quadword en la pila.",
      "pop copia el tope de la pila y luego aumenta rsp en 8.",
      "call guarda la dirección de retorno y salta a la función.",
      "ret recupera la dirección de retorno desde la pila.",
      "Si haces push dentro de una función, debes balancearlo con pop o restaurar rsp.",
      "rax se usa para retornos enteros."
    ],
    example: `global sumar\n\nsumar:\n    push rbp\n    mov rbp, rsp\n\n    mov rax, rdi\n    add rax, rsi\n\n    mov rsp, rbp\n    pop rbp\n    ret`,
    explanation: [
      "rdi contiene el primer parámetro entero.",
      "rsi contiene el segundo parámetro entero.",
      "rax retorna el resultado.",
      "El prólogo y epílogo preservan el marco de pila."
    ],
    pitfall: "Corromper la pila: si haces push sin pop correspondiente, ret puede saltar a una dirección incorrecta."
  },
  {
    id: "flotantes",
    title: "9. Números flotantes",
    short: "xmm0-xmm15, movss, movsd, addsd",
    icon: "X",
    summary:
      "Los flotantes no se trabajan normalmente con rax, rbx o rcx, sino con registros XMM. Para precisión simple se usan instrucciones terminadas en ss; para precisión doble, instrucciones terminadas en sd.",
    keyPoints: [
      "xmm0 a xmm15 son registros de 128 bits.",
      "movss mueve flotantes de 32 bits.",
      "movsd mueve flotantes de 64 bits.",
      "addss/addsd suman flotantes.",
      "subss/subsd restan flotantes.",
      "mulss/mulsd multiplican flotantes.",
      "divss/divsd dividen flotantes.",
      "El retorno flotante se coloca en xmm0."
    ],
    example: `movsd xmm0, qword [a]\naddsd xmm0, qword [b]\n; xmm0 = a + b`,
    explanation: [
      "movsd carga un flotante de 64 bits en xmm0.",
      "addsd suma otro flotante de 64 bits.",
      "El resultado queda en xmm0."
    ],
    pitfall: "Intentar mover un inmediato directamente a xmm0 con movsd. Las instrucciones de flotantes no aceptan inmediatos de esa forma."
  },
  {
    id: "cadenas",
    title: "10. Instrucciones de cadena",
    short: "stosx, lodsx, movsx, cmpsx, scasx, rep",
    icon: "C",
    summary:
      "Las instrucciones de cadena facilitan trabajar con secuencias: vectores e hileras. Usan registros específicos: rsi como fuente, rdi como destino, rax como acumulador y rcx como contador para repeticiones.",
    keyPoints: [
      "stosb/stosw/stosd/stosq guardan AL/AX/EAX/RAX en [RDI] y avanzan RDI.",
      "lodsb/lodsw/lodsd/lodsq cargan desde [RSI] hacia AL/AX/EAX/RAX y avanzan RSI.",
      "movsb/movsw/movsd/movsq copian de [RSI] a [RDI] y avanzan ambos.",
      "cmpsb compara [RSI] con [RDI].",
      "scasb compara AL con [RDI].",
      "rep repite mientras rcx no sea cero.",
      "cld pone la dirección hacia adelante; std hacia atrás."
    ],
    example: `mov rsi, origen\nmov rdi, destino\nmov rcx, 10\ncld\nrep movsb`,
    explanation: [
      "rsi apunta al origen.",
      "rdi apunta al destino.",
      "rcx indica cuántos bytes copiar.",
      "rep movsb copia 10 bytes."
    ],
    pitfall: "Olvidar que las instrucciones de cadena dependen de rsi, rdi, rax, rcx y de la bandera de dirección."
  }
];

const questions = [
  {
    module: "intro",
    type: "mcq",
    question: "¿Qué hace NASM?",
    options: ["Ejecuta syscalls", "Traduce ensamblador a código objeto", "Administra la pila", "Convierte números a flotantes"],
    answer: 1,
    explanation: "NASM es el ensamblador. Traduce instrucciones de ensamblador a código objeto."
  },
  {
    module: "registros",
    type: "mcq",
    question: "¿Qué ocurre al escribir en eax?",
    options: ["Solo cambia al", "Se limpian los 32 bits superiores de rax", "Se modifica rip", "Se guarda un valor en la pila"],
    answer: 1,
    explanation: "En x86-64, escribir en un registro de 32 bits como eax pone en cero los 32 bits superiores del registro de 64 bits."
  },
  {
    module: "formato",
    type: "fill",
    question: "Completa: La sección donde se escribe el código ejecutable es section ____.",
    answers: [".text", "text"],
    explanation: "section .text contiene las instrucciones del programa."
  },
  {
    module: "aritmetica",
    type: "mcq",
    question: "En add rax, rbx, ¿dónde queda guardado el resultado?",
    options: ["En rbx", "En rax", "En rsp", "En rip"],
    answer: 1,
    explanation: "El primer operando es el destino. add rax, rbx guarda el resultado en rax."
  },
  {
    module: "logicas",
    type: "fill",
    question: "Completa: La instrucción usada comúnmente para poner un registro en cero es xor reg, ____.",
    answers: ["reg", "el mismo registro", "mismo registro"],
    explanation: "xor rax, rax da cero porque cada bit se compara consigo mismo."
  },
  {
    module: "saltos",
    type: "mcq",
    question: "¿Qué instrucción se usa normalmente antes de un salto condicional?",
    options: ["push", "cmp", "ret", "movsd"],
    answer: 1,
    explanation: "cmp actualiza las banderas que luego revisan instrucciones como je, jne, jl o jg."
  },
  {
    module: "input",
    type: "fill",
    question: "Para usar read en Linux x86-64, el código de syscall se coloca en rax y vale ____.",
    answers: ["0", "cero"],
    explanation: "El syscall read tiene código 0."
  },
  {
    module: "pila",
    type: "mcq",
    question: "¿Qué estructura sigue la pila?",
    options: ["FIFO", "LIFO", "Orden alfabético", "Orden aleatorio"],
    answer: 1,
    explanation: "La pila es LIFO: Last-In, First-Out."
  },
  {
    module: "flotantes",
    type: "mcq",
    question: "¿Qué registros se usan para valores flotantes?",
    options: ["rax-rdx", "rsp y rbp", "xmm0-xmm15", "rip y rFlags"],
    answer: 2,
    explanation: "Los flotantes se trabajan con registros XMM."
  },
  {
    module: "cadenas",
    type: "fill",
    question: "Completa: En instrucciones de cadena, rsi suele ser la fuente y rdi suele ser el ____.",
    answers: ["destino", "destination", "dest"],
    explanation: "RSI se asocia con source y RDI con destination."
  }
];

const extraTestQuestions = [
  {
    module: "registros",
    type: "fill",
    question: "Prueba extra: El registro que apunta al tope de la pila es ____.",
    answers: ["rsp"],
    explanation: "rsp significa stack pointer y apunta al tope de la pila."
  },
  {
    module: "aritmetica",
    type: "mcq",
    question: "Prueba extra: ¿Qué instrucción resta 1 a un registro?",
    options: ["inc", "dec", "mul", "loop"],
    answer: 1,
    explanation: "dec decrementa el operando en 1."
  }
];

const allQuestions = [...questions, ...extraTestQuestions];

const flashcards = [
  { front: "rax", back: "Registro general de 64 bits. Usado para retornos enteros y syscalls." },
  { front: "rsp", back: "Stack pointer. Apunta al tope de la pila." },
  { front: "rbp", back: "Base pointer. Usado como base del marco de pila en funciones." },
  { front: "rip", back: "Instruction pointer. Apunta a la siguiente instrucción a ejecutar." },
  { front: "cmp", back: "Compara operandos actualizando banderas; no guarda el resultado de la resta." },
  { front: "je", back: "Jump if equal. Salta si la comparación anterior dio igualdad." },
  { front: "jne", back: "Jump if not equal. Salta si no son iguales." },
  { front: "mul", back: "Multiplicación sin signo con rax como operando implícito." },
  { front: "div", back: "División sin signo. En 64 bits usa rdx:rax como dividendo." },
  { front: "xmm0", back: "Registro usado para flotantes y retorno flotante." }
];

function normalize(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function isCorrectAnswer(question, raw) {
  if (question.type === "mcq") return Number(raw) === question.answer;
  return question.answers.includes(normalize(raw || ""));
}

function runInternalTests() {
  const results = [];
  const moduleIds = new Set(modules.map((m) => m.id));

  results.push({
    name: "Hay al menos 10 módulos de estudio",
    pass: modules.length >= 10
  });

  results.push({
    name: "Todos los módulos tienen resumen, ejemplo y error común",
    pass: modules.every((m) => m.summary && m.example && m.pitfall)
  });

  results.push({
    name: "Cada pregunta pertenece a un módulo existente",
    pass: allQuestions.every((q) => moduleIds.has(q.module))
  });

  results.push({
    name: "Las preguntas de opción múltiple tienen índice correcto válido",
    pass: allQuestions
      .filter((q) => q.type === "mcq")
      .every((q) => Array.isArray(q.options) && q.options.length >= 2 && q.answer >= 0 && q.answer < q.options.length)
  });

  results.push({
    name: "Las preguntas de completar tienen al menos una respuesta aceptada",
    pass: allQuestions
      .filter((q) => q.type === "fill")
      .every((q) => Array.isArray(q.answers) && q.answers.length >= 1)
  });

  results.push({
    name: "Prueba de normalización: '.TEXT' se acepta como '.text'",
    pass: normalize("  .TEXT  ") === ".text"
  });

  results.push({
    name: "Prueba de corrección: respuesta 'rsp' es válida en la prueba extra",
    pass: isCorrectAnswer(extraTestQuestions[0], "rsp")
  });

  return results;
}

function ProgressBar({ value }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-slate-900 transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

function CodeBlock({ children }) {
  return (
    <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100 shadow-inner">
      <code>{children}</code>
    </pre>
  );
}

function ModulePanel({ module, completed, onComplete }) {
  const [openExample, setOpenExample] = useState(true);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Icon label={module.icon} size="large" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-950">{module.title}</h2>
            {completed ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                <StatusIcon ok={true} /> Visto
              </span>
            ) : (
              <button
                onClick={onComplete}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Marcar como visto
              </button>
            )}
          </div>
          <p className="mt-3 leading-7 text-slate-700">{module.summary}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="mb-3 font-semibold text-slate-950">Ideas clave</h3>
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {module.keyPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-slate-900" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-amber-50 p-4">
          <h3 className="mb-2 font-semibold text-amber-950">Error común</h3>
          <p className="text-sm leading-6 text-amber-900">{module.pitfall}</p>
        </div>
      </div>

      <div className="mt-5">
        <button
          onClick={() => setOpenExample(!openExample)}
          className="mb-3 flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left font-semibold text-slate-950 transition hover:bg-slate-50"
        >
          Ver ejemplo de código
          <span className={`transition ${openExample ? "rotate-90" : ""}`}>›</span>
        </button>
        {openExample && (
          <div className="grid gap-4 lg:grid-cols-2">
            <CodeBlock>{module.example}</CodeBlock>
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="mb-3 font-semibold text-slate-950">Qué está pasando</h3>
              <ol className="space-y-2 text-sm leading-6 text-slate-700">
                {module.explanation.map((item, idx) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{idx + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PracticePanel({ activeModule }) {
  const filtered = allQuestions.filter((q) => q.module === activeModule.id);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});

  function answerQuestion(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function checkQuestion(index) {
    setChecked((prev) => ({ ...prev, [index]: true }));
  }

  function reset() {
    setAnswers({});
    setChecked({});
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Práctica del tema</h2>
          <p className="mt-1 text-sm text-slate-600">Responde y revisa tu resultado al instante.</p>
        </div>
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
          ↺ Reiniciar
        </button>
      </div>

      {filtered.map((q, index) => {
        const raw = answers[index];
        const wasChecked = checked[index];
        const isCorrect = isCorrectAnswer(q, raw);

        return (
          <div key={`${q.module}-${q.question}`} className="mb-4 rounded-2xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">{q.question}</p>

            {q.type === "mcq" ? (
              <div className="mt-3 grid gap-2">
                {q.options.map((option, optIndex) => (
                  <button
                    key={option}
                    onClick={() => answerQuestion(index, optIndex)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      Number(raw) === optIndex
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:bg-slate-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={raw || ""}
                onChange={(e) => answerQuestion(index, e.target.value)}
                placeholder="Escribe tu respuesta aquí"
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
              />
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => checkQuestion(index)}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Revisar
              </button>
              {wasChecked && (
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  <StatusIcon ok={isCorrect} />
                  {isCorrect ? "Correcto" : "Revisar"}
                </span>
              )}
            </div>

            {wasChecked && (
              <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">{q.explanation}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}

function FlashcardPanel() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = flashcards[index];

  function next() {
    setIndex((prev) => (prev + 1) % flashcards.length);
    setFlipped(false);
  }

  function prev() {
    setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setFlipped(false);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Tarjetas rápidas</h2>
      <p className="mt-1 text-sm text-slate-600">Haz clic en la tarjeta para ver la respuesta.</p>

      <button
        onClick={() => setFlipped(!flipped)}
        className="mt-4 min-h-40 w-full rounded-3xl bg-slate-900 p-6 text-center text-white shadow-sm transition hover:bg-slate-800"
      >
        <div className="text-sm uppercase tracking-wide text-slate-300">{flipped ? "Respuesta" : "Concepto"}</div>
        <div className="mt-4 text-2xl font-bold">{flipped ? card.back : card.front}</div>
      </button>

      <div className="mt-4 flex items-center justify-between">
        <button onClick={prev} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Anterior</button>
        <span className="text-sm font-medium text-slate-600">{index + 1} / {flashcards.length}</span>
        <button onClick={next} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Siguiente</button>
      </div>
    </section>
  );
}

function GlobalQuiz() {
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);

  const score = useMemo(() => {
    return allQuestions.reduce((acc, q, index) => acc + (isCorrectAnswer(q, answers[index]) ? 1 : 0), 0);
  }, [answers]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Quiz global</h2>
          <p className="mt-1 text-sm text-slate-600">Preguntas de toda la materia, incluyendo pruebas extra.</p>
        </div>
        <button onClick={() => setShowScore(true)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          Calcular nota
        </button>
      </div>

      <div className="space-y-4">
        {allQuestions.map((q, index) => {
          const raw = answers[index];
          const ok = isCorrectAnswer(q, raw);
          return (
            <div key={`${q.module}-${q.question}`} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">{index + 1}. {q.question}</p>
              {q.type === "mcq" ? (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {q.options.map((option, optIndex) => (
                    <button
                      key={option}
                      onClick={() => setAnswers((prev) => ({ ...prev, [index]: optIndex }))}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                        Number(raw) === optIndex
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white hover:bg-slate-100"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  value={raw || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
                  placeholder="Escribe tu respuesta"
                  className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                />
              )}
              {showScore && (
                <p className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  <StatusIcon ok={ok} />
                  {ok ? "Correcto" : `Incorrecto: ${q.explanation}`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {showScore && (
        <div className="mt-5 rounded-2xl border border-slate-200 p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Resultado</span>
            <span>{score} / {allQuestions.length}</span>
          </div>
          <ProgressBar value={(score / allQuestions.length) * 100} />
        </div>
      )}
    </section>
  );
}

function InternalTestsPanel() {
  const tests = runInternalTests();
  const passed = tests.filter((test) => test.pass).length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Pruebas internas</h2>
      <p className="mt-1 text-sm text-slate-600">Validaciones básicas para comprobar que el resumen interactivo está consistente.</p>
      <div className="mt-4 rounded-2xl border border-slate-200 p-4">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Pruebas aprobadas</span>
          <span>{passed} / {tests.length}</span>
        </div>
        <ProgressBar value={(passed / tests.length) * 100} />
      </div>
      <div className="mt-4 space-y-2">
        {tests.map((test) => (
          <div key={test.name} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
            <StatusIcon ok={test.pass} />
            <span>{test.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function InteractiveAssemblySummary() {
  const [activeId, setActiveId] = useState(modules[0].id);
  const [completed, setCompleted] = useState({});
  const [mode, setMode] = useState("resumen");

  const activeModule = modules.find((m) => m.id === activeId) || modules[0];
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((completedCount / modules.length) * 100);

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-950 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">Lenguaje ensamblador x86-64</p>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Resumen interactivo de toda la materia</h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-300">
                Estudia por bloques, abre ejemplos, contesta preguntas, completa espacios y usa tarjetas rápidas para memorizar registros e instrucciones.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 lg:w-80">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-200">
                <span>Progreso de lectura</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
              <p className="mt-2 text-sm text-slate-300">{completedCount} de {modules.length} bloques vistos</p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-950">Modo</h2>
              <div className="grid gap-2">
                {[
                  ["resumen", "Resumen + práctica"],
                  ["tarjetas", "Tarjetas rápidas"],
                  ["quiz", "Quiz global"],
                  ["tests", "Pruebas internas"]
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${mode === id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <nav className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-950">Temas</h2>
              <div className="space-y-2">
                {modules.map((module) => {
                  const active = module.id === activeId;
                  return (
                    <button
                      key={module.id}
                      onClick={() => {
                        setActiveId(module.id);
                        setMode("resumen");
                      }}
                      className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon label={module.icon} size="small" />
                        <div>
                          <div className="text-sm font-bold">{module.title}</div>
                          <div className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{module.short}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          <main className="space-y-6">
            {mode === "resumen" && (
              <>
                <ModulePanel
                  module={activeModule}
                  completed={Boolean(completed[activeModule.id])}
                  onComplete={() => setCompleted((prev) => ({ ...prev, [activeModule.id]: true }))}
                />
                <PracticePanel activeModule={activeModule} />
              </>
            )}
            {mode === "tarjetas" && <FlashcardPanel />}
            {mode === "quiz" && <GlobalQuiz />}
            {mode === "tests" && <InternalTestsPanel />}
          </main>
        </div>
      </div>
    </div>
  );
}
