# 181_36_Cursor_5400_Cat

Depot de documentation pour la collection locale `181_36_Cursor_5400_Cat`.

Ce depot sert a conserver les informations essentielles du projet sans envoyer les fichiers lourds ou binaires vers GitHub. Les images, fichiers audio, videos, PDF, archives et dossiers de contenu restent en local et sont volontairement exclus du suivi Git.

## Raccordement Git

- Depot GitHub : <https://github.com/Delfosse-Pascal/181_36_Cursor_5400_Cat>
- Dossier local : `C:\Users\Pascal509\Desktop\181_36_Cursor_5400_Cat`
- Branche principale : `main`

Le dossier local est raccorde au depot GitHub via le remote `origin`.

## Contenu local

Le dossier local contient principalement une collection de curseurs et quelques fichiers musicaux :

- `Les_Curseurs/` : collection locale de curseurs classes par dossiers.
- `Musiques/` : fichiers audio locaux associes au projet.

Ces dossiers ne sont pas suivis dans Git afin de garder le depot propre, rapide a cloner et conforme a la consigne d'exclure les medias.

## Fichiers versionnes

Le depot GitHub doit contenir uniquement les fichiers de base places a la racine, par exemple :

- `README.md` : documentation du depot.
- `.gitignore` : regles d'exclusion pour eviter l'ajout des dossiers et fichiers lourds.

## Fichiers exclus

Les types de fichiers suivants sont exclus du suivi Git :

- images : `png`, `jpg`, `jpeg`, `gif`, `webp`, `bmp`, `ico`, `svg`, `tif`, `tiff`, `avif`
- PDF : `pdf`
- videos : `mp4`, `mov`, `avi`, `mkv`, `webm`, `wmv`, `flv`, `m4v`
- audio : `mp3`, `wav`, `flac`, `aac`, `ogg`, `m4a`, `wma`
- archives : `zip`, `rar`, `7z`, `tar`, `gz`, `bz2`, `xz`, `iso`
- dossiers de contenu locaux, notamment `Les_Curseurs/` et `Musiques/`

## Utilisation recommandee

1. Garder les fichiers de contenu volumineux en local.
2. Mettre a jour cette documentation lorsque l'organisation locale change.
3. Verifier l'etat Git avant chaque commit avec :

```powershell
git status
```

4. Ajouter uniquement les fichiers racine utiles :

```powershell
git add README.md .gitignore
```

## Notes

Ce depot n'est pas destine a heberger directement la collection complete de fichiers media. Il sert plutot de point de reference documente pour identifier le dossier local, son depot GitHub associe et les regles de versionnement appliquees.
