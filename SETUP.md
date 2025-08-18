# 🚀 Guia de Configuração do Deploy

## 1️⃣ Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e crie um novo repositório
2. Nome sugerido: `childfund-doe-deploy`
3. Marque como **Privado** (para segurança)
4. **NÃO** inicialize com README (já temos um)

## 2️⃣ Configurar Secrets no GitHub

Vá em: **Settings → Secrets and variables → Actions → New repository secret**

Adicione os seguintes secrets:

### 🔐 Produção
- **DEPLOY_HOST**: `217.196.62.74`
- **DEPLOY_USER**: `deploy-doe`
- **DEPLOY_PATH**: `/var/www/doe.childfundbrasil.org.br`
- **DEPLOY_SSH_KEY**: ⚠️ **Conteúdo do arquivo `deploy-doe-key` (chave privada)**

### 🧪 Staging (Opcional)
- **STAGING_HOST**: `217.196.62.74`
- **STAGING_USER**: `deploy-doe`
- **STAGING_PATH**: `/var/www/doe-staging.childfundbrasil.org.br`
- **STAGING_SSH_KEY**: (mesma chave ou outra dedicada)

## 3️⃣ Inicializar Repositório Local

Copie os arquivos do projeto atual para a pasta de deploy e execute:

```bash
cd "D:\0_Filipe\ChildFund\deployments\doe-production"
git init
git add .
git commit -m "🚀 Initial commit - Deploy setup"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/childfund-doe-deploy.git
git push -u origin main
```

## 4️⃣ Configurar Environments (Recomendado)

No GitHub, vá em: **Settings → Environments**

### 📊 Production Environment
- Nome: `production`
- Protection rules:
  - ✅ Required reviewers (opcional)
  - ✅ Wait timer: 0 minutes
  - ✅ Restrict pushes to protected branches

### 🧪 Staging Environment
- Nome: `staging`
- Protection rules: (mais permissivo que produção)

## 5️⃣ Testar o Deploy

### Primeira vez:
```bash
git add .
git commit -m "✨ Primeira alteração para testar deploy"
git push
```

### Deploy manual:
1. Vá na aba **Actions**
2. Selecione o workflow **Deploy to Production**
3. Clique em **Run workflow**

## 6️⃣ Verificação

Após o deploy:
1. ✅ Acesse: http://217.196.62.74:8080
2. ✅ Verifique os logs no GitHub Actions
3. ✅ Confirme que os arquivos foram atualizados no servidor

## 🔒 Segurança

- ✅ Usuário dedicado com permissões limitadas
- ✅ Chave SSH específica apenas para deploy
- ✅ Isolamento completo de outros projetos
- ✅ Backup automático antes de cada deploy
- ✅ Secrets protegidos no GitHub

## 📞 Em caso de problemas

1. Verifique os logs do GitHub Actions
2. Teste conexão SSH: `ssh -i deploy-doe-key deploy-doe@217.196.62.74`
3. Verifique permissões no servidor: `ls -la /var/www/`