@echo off
title Generateur de Lien Invite - Portail Post-its
color 0B
echo ===================================================
echo    GENERATEUR DE LIEN INVITE (PERSONNALISE)
echo ===================================================
echo.
set /p nom="Nom de l'invite (ex: ecole, ami, test) : "
set /p jours="Durée de validité en jours (ex: 7) : "

echo.
echo [1/2] Creation du canal de partage : %nom%...
echo ---------------------------------------------------
cmd /c "npx firebase-tools@latest hosting:channel:deploy %nom% --expires %jours%d --project portail-postits"
echo ---------------------------------------------------
echo.
echo Termine ! Le lien ci-dessus est reserve pour : %nom%
echo Il expirera automatiquement dans %jours% jours.
echo.
pause
