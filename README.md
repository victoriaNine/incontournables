# Les Incontournables de 2016

## Concept

Il s'agit d'une rétrospective de fin d'année simple. L'idée serait de proposer aux utilisateurs de consulter les tops films et séries de l'année écoulée, et de cocher ceux qu'ils ont vus. Arrivé à la fin du top, l'utilisateur peut consulter son "score" (le nombre de films et séries vues). Il a également la possibilité de consulter la fiche et de regarder les trailers de chacun des films et séries. La fiche détaillée comporte un CTA qui renverrait vers la page liée au film ou à la série sur le site de myCanal.


## Améliorations possibles du concept

L'application est actuellement très simple, seul le top film est implémenté. Il serait possible de rajouter le top séries, qui au clic sur "Voir les séries" (cf. capture maquette psd) viendrait remplacer le top films.
D'autres fonctionnalités comme le partage du score sur les réseaux sociaux pourrait être intéressantes.
Dans le cadre d'un abonné myCanal, il pourrait être plus intéressant de montrer à l'utilisateur les films et séries qu'il/elle a le plus regardé au cours de l'année, avec d'autres statistiques comme les acteurs les plus regardés, des comportements spécifiques selon la période de l'année, etc.

[![Maquette PSD](http://orion9.net/_demos/incontournables/_readme/maquette.jpg)](http://orion9.net/_demos/incontournables/_readme/maquette.jpg)


## Tech

L'application utilise React, ainsi qu'un système d'événements basé sur celui de Backbone que j'ai customisé (principalement, l'ajout d'un support pour les namespaces). Côté visuel, j'ai utilisé Vibrant.js pour détecter les couleurs dominantes des images, GreenSock pour les animations, et SASS comme préprocesseur CSS. Le module "store" est un utilitaire me permettant de centraliser des données entre les différents composants de l'application, ainsi que d'utiliser plusieurs fonctions pratiques qui m'évitent de répeter du code (cf. capture). J'utilise également Lodash.

[![Architecture du "store"](http://orion9.net/_demos/incontournables/_readme/store.jpg)](http://orion9.net/_demos/incontournables/_readme/store.jpg)

J'avais initialement en tête de charger les données des films au lancement de l'application afin d'éviter tout temps de chargement pendant son utilisation. Cependant l'API de TMDB limite le nombre de requêtes à 40 toutes les 10 secondes. J'ai donc opté pour le chargement des données d'un film lorsque l'on clique sur "Voir la fiche", d'où un léger temps de chargement au clic.

La nomenclature des fichiers est la suivante : dans "ui", les fichiers "ui_Screen" représentent les écrans à proprement parler, et "ui_Elem" les sous-composants visuels. Je les ai préfixés "ui_" car dans un framework MVC il serait possible d'avoir "ui_topSeries" dans un dossier et "model_topSeries" dans un autre, par exemple. (Je vous invite à regarder [ce repositoire](https://github.com/victoriaNine/xvthTriad/tree/master/app/js) pour vous faire une idée plus claire de l'architecture que j'utilise à plus grande échelle).

Côté responsive et cross-browser, j'ai ajusté le viewport de manière à ce que l'application passe sous tous supports. Elle prend en charge les événements tactiles. Je ne l'ai pas optimisé pour supports mobiles, mais elle tourne (test rapide sur Sony Xperia XZ). J'ai développé sous Chrome Windows 8. J'ai fait quelques ajustements rapides pour Firefox. Je ne l'ai pas testée sous OSX/iOS cependant.


## Améliorations possibles tech

La base pour implémenter le top séries est déjà présente, j'ai laissé le composant "ElemTopItem" neutre de manière à ce qu'il puisse servir aussi bien pour les films que les séries. Il faudrait refactoriser "ScreenTopMovie" en classe abstraite "ScreenTop", dont hériteraient "ScreenTopMovie" et "ScreenTopTV".
Il pourrait être possible de créer aussi une classe abstraite de base "Screen", qui contiendrait par exemple la méthode "screenTransition", actuellement identique dans "ScreenHome" et "ScreenTopMovie". Évidemment, une versione optimisée pour supports mobiles seraient un plus.


## Temps

J'ai pris la journée de vendredi 24 pour chercher un concept et réaliser le design. Le développement a eu lieu sur le weekend, avec finalisation et déploiement lundi.


Merci d'avoir lu !
