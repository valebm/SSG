SSG
=============

About the Static Site Generator
-------------------------------

This is a project developed for the Immersive Program at Brainstation (Costa Rica) by Valeria Bolaños.
SSG is a NPM package for easy static site building using Embedded JS, HTML, YAML, and Markdown.

Installation
------------

> npm install @valebm/ssg -g

Initialization
--------------

 >ssg-start --project *project_name*
 
Build project
-------------
Builds project into docs folder.

>ssg- --build 

Create new post
---------------
Creates new post into posts folder.

>ssg --post *post_name*

Create new draft
----------------
Creates new draft into drafts folder.

>ssg --draft *draft_name*

Post draft
----------
Moves draft to posts folder.

>ssg --postdraft *draft_name*

Deployment
----------

GitHub supports de docs folder, letting you post your page in Settings>GitHub Pages>Source> master branch/docs folder.

