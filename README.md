# Piano Tutor Web

Minimalna implementacja aplikacji do nauki gry na pianinie. Projekt wykorzystuje React z biblioteką React Piano oraz Tone.js do odtwarzania dźwięków. Dodano obsługę mikrofonu z wykrywaniem wysokości dźwięku (Pitchy). Zrezygnowano z funkcji społecznościowych.

## Uruchomienie

1. Otwórz plik `src/index.html` w przeglądarce.
2. Klawiatura zadziała od razu – dźwięki są pobierane z darmowych sampli.
3. Aby włączyć rozpoznawanie dźwięku z mikrofonu, kliknij przycisk **Uruchom mikrofon**.
4. Wybierz jedną z lekcji z listy rozwijanej na stronie (skala, akord lub prosta melodia).
5. Program podpowiada kolejny dźwięk do zagrania i sprawdza poprawność również przez mikrofon.
6. Lekcję można zrestartować przyciskiem **Restart**.
7. Możesz włączyć metronom przyciskiem **Metronom start/stop**.
8. Suwak "Tempo" pozwala ustawić prędkość metronomu w zakresie 40‑180 BPM.
9. Po ukończeniu lekcji w liście obok jej nazwy pojawi się znak ✓.

Projekt na razie jest bardzo prosty i ma służyć jako punkt startowy do dalszego rozwoju.
Możesz rozwijać go o kolejne lekcje, akordy oraz ćwiczenia rytmiczne.
