# Barber SBX — website

Onepager voor [Barber SBX](https://www.instagram.com/barber_sbx7/), barbier op
Grote Kaai 9, 9160 Lokeren. Statische site zonder build-stap: alleen HTML, CSS
en JavaScript.

## Lokaal bekijken

De video's worden via JavaScript bestuurd, dus open `index.html` niet
rechtstreeks vanaf je schijf maar start een kleine webserver:

```bash
python -m http.server 5173
```

Daarna surf je naar <http://127.0.0.1:5173>.

## Structuur

```
index.html          alle secties van de pagina
css/style.css       opmaak, animaties en responsive regels
js/main.js          menu, scroll-effecten, video's, carrousel, lightbox
assets/video/       reels uit Instagram (hero.mp4, cut-1.mp4, cut-2.mp4)
assets/img/         stills die uit die video's zijn geknipt
```

## Deployen

De site publiceert zichzelf via GitHub Actions (`.github/workflows/deploy.yml`).
Eenmalig instellen:

1. Ga naar **Settings → Pages**.
2. Zet **Source** op **GitHub Actions**.

Elke push naar `main` publiceert daarna automatisch naar
<https://majdi3112.github.io/Barber34/>.

### Eigen domeinnaam

Gebruik je later een eigen domein, pas dan deze drie plekken in `index.html`
aan naar de nieuwe URL: `link rel="canonical"`, `og:image` en `og:url`.
Social media hebben absolute URL's nodig, relatieve paden werken daar niet.

## Nog in te vullen

Deze gegevens stonden niet op Instagram en zijn dus nog niet echt:

- **Openingsuren** — staan nu als "Zie Instagram" in de sectie Locatie
  (gemarkeerd met een `TODO` in `index.html`).
- **Prijzen** — de dienstenkaarten staan bewust zonder prijs.
- **Telefoonnummer** — er staat nergens een nummer; alle contact loopt via
  Instagram DM.

## Instagram highlights

Story-highlights kunnen niet zonder ingelogde sessie opgehaald worden. De
vierde kaart bij "Voorbeeld kapsels" linkt daarom naar Instagram. Zet je een
geëxporteerde clip als `assets/video/highlight-1.mp4` in de map, dan wordt die
kaart automatisch een meespelende video zoals de andere drie.
