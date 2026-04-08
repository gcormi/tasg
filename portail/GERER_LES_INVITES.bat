@echo off
title Gestionnaire des Invites - Portail Post-its
color 0E
echo ===================================================
echo    LISTE DES ACCES INVITES ACTIFS
echo ===================================================
echo.
echo Recherche des acces en cours... veuillez patienter.
echo ---------------------------------------------------
cmd /c "npx firebase-tools@latest hosting:channel:list --project portail-postits"
echo ---------------------------------------------------
echo.
echo CONSEIL : Si vous voulez supprimer un acces, 
echo utilisez la commande : npx firebase-tools hosting:channel:delete NOM_DU_CANAL
echo.
pause
