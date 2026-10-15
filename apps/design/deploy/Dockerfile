# 놀이터 정적 파일(storybook build 결과)만 담는 이미지. 빌드는 CI(design-system.yml)가 검증과 함께 먼저 한다 —
# 여기서 다시 빌드하면 검증 안 된 산출물이 나갈 수 있어서 결과물만 받는다.
#   docker build -f apps/design/deploy/Dockerfile apps/design
# 비루트 nginx — 클러스터 podSecurity restricted(루트 실행 금지)에 맞춘다.
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY storybook-static /usr/share/nginx/html
EXPOSE 3000
