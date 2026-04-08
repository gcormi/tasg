@echo off
title Generateur de Lien Invite - Portail Post-its
color 0B
echo ===================================================
echo    GENERATEUR DE LIEN INVITE (TEMPORAIRE)
echo ===================================================
echo.
set /p jours="Pendant combien de jours l'acces doit-il etre valide ? (ex: 7) : "

echo.
echo [1/2] Preparation du lien de partage...
echo ---------------------------------------------------
cmd /c "npx firebase-tools@latest hosting:channel:deploy invite-%random% --expires %jours%d --project portail-postits"
echo ---------------------------------------------------
echo.
echo Termine ! Le lien ci-dessus est utilisable par vos invites.
echo Il expirera automatiquement dans %jours% jours.
echo.
pause
