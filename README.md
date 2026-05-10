# 181_36_Cursor_5400_Cat

Depot de base pour documenter et piloter le site local de la collection `181_36_Cursor_5400_Cat`.

Ce depot est volontairement leger : il conserve uniquement les fichiers essentiels places a la racine du projet. Les dossiers de contenu, les images, les fichiers audio, les videos, les PDF et les archives restent en local et ne sont pas envoyes vers GitHub.

## Raccordement Git

- Depot GitHub : <https://github.com/Delfosse-Pascal/181_36_Cursor_5400_Cat>
- Dossier local : `C:\Users\Pascal509\Desktop\181_36_Cursor_5400_Cat`
- Branche principale : `main`
- Remote Git : `origin`

Le dossier local est raccorde au depot GitHub ci-dessus. Le depot distant sert a garder les tiroirs de base du projet : documentation, page d'accueil, styles, scripts et outil de generation.

## Objectif du projet

Le projet sert a presenter localement une grande collection de curseurs sous forme de site HTML navigable.

Le site local permet de :

- ouvrir une page d'accueil generale avec `index.html` ;
- acceder aux galeries des dossiers `Curseurs_*` ;
- afficher les images sous forme de miniatures ;
- ouvrir chaque image en grand au clic ;
- fermer l'affichage agrandi avec la touche `Echap` ;
- utiliser un mode clair / sombre ;
- lire les musiques locales uniquement apres action manuelle ;
- naviguer entre les pages sans dependance Internet obligatoire.

Les ressources externes ajoutees dans les pages HTML sont optionnelles. Le site reste utilisable localement meme si ces ressources ne chargent pas.

## Structure locale

La structure principale du dossier local est la suivante :

```text
181_36_Cursor_5400_Cat/
|-- README.md
|-- .gitignore
|-- index.html
|-- site.css
|-- site.js
|-- build-site.js
|-- Les_Curseurs/
`-- Musiques/
```

## Fichiers conserves dans Git

Seuls les fichiers racine utiles sont suivis dans Git :

- `README.md` : documentation claire du projet, de son fonctionnement et des regles de versionnement.
- `.gitignore` : exclusions pour garder hors Git les dossiers et fichiers lourds.
- `index.html` : page d'accueil principale du site local.
- `site.css` : style commun du site local.
- `site.js` : interactions communes du site local.
- `build-site.js` : script de generation des pages HTML locales dans les dossiers de contenu.

Ces fichiers sont les tiroirs de base du projet. Ils suffisent a documenter et reconstruire l'organisation HTML locale, sans pousser les medias.

## Contenu local non versionne

Les dossiers suivants restent sur la machine, mais sont ignores par Git :

- `Les_Curseurs/` : collection locale de curseurs et pages HTML generees dans les sous-dossiers `Curseurs_*`.
- `Musiques/` : musiques locales utilisees par le lecteur audio de la page d'accueil.

Ces dossiers peuvent contenir beaucoup de fichiers et de medias. Ils ne doivent pas etre ajoutes au depot GitHub.

## Site HTML local

La page d'accueil principale est :

```text
index.html
```

Elle sert d'entree generale au site local. Elle contient :

- une navigation vers les collections `Curseurs_*` ;
- des miniatures de presentation ;
- un bouton rouge `Musique` ;
- un lecteur audio sans lecture automatique ;
- un mode clair / sombre ;
- les menus demandes dans le haut de page.

Les pages de galerie sont generees dans les dossiers locaux `Les_Curseurs/Curseurs_*`. Elles restent ignorees par Git afin de respecter la consigne de ne pas pousser les dossiers.

## Regeneration des pages locales

Pour regenerer les pages HTML locales a partir du contenu present dans `Les_Curseurs/` et `Musiques/`, utiliser :

```powershell
node .\build-site.js
```

Le script parcourt les dossiers `Curseurs_*`, detecte les images, lit les dimensions disponibles et cree automatiquement les pages HTML necessaires. Les gros dossiers sont decoupes en plusieurs pages reliees entre elles.

## Fichiers exclus

Les types de fichiers suivants sont exclus du suivi Git :

- images : `png`, `jpg`, `jpeg`, `gif`, `webp`, `bmp`, `ico`, `svg`, `tif`, `tiff`, `avif`
- PDF : `pdf`
- videos : `mp4`, `mov`, `avi`, `mkv`, `webm`, `wmv`, `flv`, `m4v`
- audio : `mp3`, `wav`, `flac`, `aac`, `ogg`, `m4a`, `wma`
- archives : `zip`, `rar`, `7z`, `tar`, `gz`, `bz2`, `xz`, `iso`
- dossiers : tous les dossiers de contenu sont ignores par defaut

## Verification avant commit

Avant un commit, verifier que seuls les fichiers racine utiles sont suivis :

```powershell
git status --short --ignored
```

Les dossiers de contenu doivent apparaitre comme ignores, par exemple :

```text
!! Les_Curseurs/
!! Musiques/
```

Les fichiers a ajouter doivent rester au niveau racine du projet.

## Commandes Git utiles

Ajouter uniquement les fichiers de base :

```powershell
git add README.md .gitignore index.html site.css site.js build-site.js
```

Creer un commit :

```powershell
git commit -m "Update local site documentation"
```

Envoyer vers GitHub :

```powershell
git push
```

## Notes importantes

- Le depot GitHub ne contient pas la collection complete de medias.
- Le site local fonctionne avec les fichiers presents sur la machine.
- Les pages generees dans les dossiers de contenu ne sont pas poussees.
- Les fichiers lourds restent exclus afin de garder le depot rapide, propre et facile a maintenir.
