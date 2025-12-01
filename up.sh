# 5. Instalar dependências (se necessário)
npm install

# 6. Gerar Prisma Client
npx prisma generate

# 7. Aplicar mudanças no banco (NOVO modelo SystemSettings)
npx prisma db push

# 8. Fazer build
npm run build

npm start

xdg-open http://localhost:3000