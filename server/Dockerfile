# 使用 Node.js 20 的轻量版镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 先复制依赖文件（利用 Docker 缓存）
COPY package*.json ./

# 设置 npm 镜像为阿里源，加速依赖下载
RUN npm config set registry https://registry.npmmirror.com

# 安装 canvas 所需的系统依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    pixman-dev

# 安装项目依赖（跳过 peer 冲突，禁用审计日志）
RUN npm install --production --legacy-peer-deps --no-audit --progress=false

# 复制项目全部代码
COPY . .

# 暴露端口
EXPOSE 8080

# 启动服务
CMD ["npm", "start"]


