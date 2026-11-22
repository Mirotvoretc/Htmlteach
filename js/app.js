(function () {
  var S = { xp: 0, done: [] };
  try { S = Object.assign(S, JSON.parse(localStorage.getItem("kodomir") || "{}")); } catch (e) {}
  var app = document.getElementById("app");

  function save() { try { localStorage.setItem("kodomir", JSON.stringify(S)); } catch (e) {} }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function hud() {
    document.getElementById("lvl").textContent = "ур. " + (Math.floor(S.xp / 100) + 1);
    document.getElementById("xp").textContent = S.xp + " XP";
    document.getElementById("xpbar").style.width = (S.xp % 100) + "%";
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function map() {
    app.innerHTML = ""; hud();
    app.appendChild(el("h1", "", "Карта Кодомира"));
    var last = "", trail = null;
    LESSONS.forEach(function (l, i) {
      if (l.zone !== last) {
        app.appendChild(el("div", "zone", l.zone));
        trail = el("div", "trail"); app.appendChild(trail); last = l.zone;
      }
      var open = i === 0 || S.done.indexOf(LESSONS[i - 1].id) > -1;
      var done = S.done.indexOf(l.id) > -1;
      var b = el("button", "node" + (done ? " done" : ""),
        '<span class="ico">' + (done ? "✅" : open ? l.icon : "🔒") + "</span><span>" + l.title + " <small>(+" + l.xp + " XP)</small></span>");
      b.disabled = !open;
      b.onclick = function () { lesson(l); };
      trail.appendChild(b);
    });
    app.appendChild(el("div", "zone", "Скоро в Кодомире"));
    var t2 = el("div", "trail"); app.appendChild(t2);
    SOON.forEach(function (t) {
      var b = el("button", "node", '<span class="ico">🌫️</span><span>' + t + "</span>");
      b.disabled = true; t2.appendChild(b);
    });
    var r = el("button", "btn ghost", "Сбросить прогресс");
    r.onclick = function () {
      if (confirm("Сбросить весь прогресс?")) { S = { xp: 0, done: [] }; save(); map(); }
    };
    app.appendChild(el("p")); app.appendChild(r);
  }

  function lesson(l) {
    app.innerHTML = "";
    app.appendChild(el("h2", "", l.icon + " " + l.title));
    app.appendChild(el("div", "box", l.theory));
    var go = el("button", "btn", "Начать квест ⚔️");
    go.onclick = function () { quest(l); };
    var back = el("button", "btn ghost", "Назад");
    back.onclick = map;
    app.appendChild(go); app.appendChild(document.createTextNode(" ")); app.appendChild(back);
    window.scrollTo(0, 0);
  }

  function quest(l) {
    var i = 0, hearts = 3, mistakes = 0;
    function show() {
      app.innerHTML = "";
      var q = l.quiz[i];
      app.appendChild(el("div", "hearts", (hearts > 0 ? "❤️".repeat(hearts) : "💀") + " &nbsp; Вопрос " + (i + 1) + " из " + l.quiz.length));
      var box = el("div", "box"), b = el("b"); b.textContent = q.q; box.appendChild(b); app.appendChild(box);
      var why = el("div", "why"), next = el("button", "btn", "Дальше");
      next.style.display = "none";
      var opts = {}, locked = false;
      shuffle(q.a.map(function (_, k) { return k; })).forEach(function (k) {
        var o = el("button", "opt"); o.textContent = q.a[k]; opts[k] = o;
        o.onclick = function () {
          if (locked) return; locked = true;
          if (k === q.c) { o.classList.add("good"); why.textContent = "Верно! " + q.why; }
          else { o.classList.add("bad"); opts[q.c].classList.add("good"); hearts--; mistakes++; why.textContent = "Мимо. " + q.why; }
          next.style.display = "";
        };
        app.appendChild(o);
      });
      app.appendChild(why); app.appendChild(next);
      next.onclick = function () {
        if (hearts <= 0) fail(); else if (++i < l.quiz.length) show(); else win();
      };
    }
    function win() {
      var first = S.done.indexOf(l.id) < 0, gain = 0;
      if (first) { gain = Math.max(10, l.xp - mistakes * 10); S.xp += gain; S.done.push(l.id); save(); }
      hud(); app.innerHTML = "";
      app.appendChild(el("h2", "", "Квест пройден! 🎉"));
      app.appendChild(el("div", "box", first ? "Награда: <b>+" + gain + " XP</b>. Следующая локация открыта." : "Ты уже проходил этот квест, награда выдаётся один раз."));
      var m = el("button", "btn", "На карту"); m.onclick = map; app.appendChild(m);
    }
    function fail() {
      app.innerHTML = "";
      app.appendChild(el("h2", "", "Герой пал 💀"));
      app.appendChild(el("div", "box", "Жизни кончились. Перечитай теорию и попробуй снова."));
      var a = el("button", "btn", "К теории"); a.onclick = function () { lesson(l); };
      var b = el("button", "btn ghost", "На карту"); b.onclick = map;
      app.appendChild(a); app.appendChild(document.createTextNode(" ")); app.appendChild(b);
    }
    show();
  }

  map();
})();
