# base image
FROM gitea/gitea:1.5.1

# copy configuration file
COPY src/AltinnRepositories/gitea-data/gitea/conf/app.ini data/gitea/conf/app.ini
COPY src/AltinnRepositories/gitea-data/gitea/options data/gitea/options/
COPY src/AltinnRepositories/gitea-data/gitea/public/img data/gitea/public/img
COPY src/AltinnRepositories/gitea-data/gitea/templates data/gitea/templates

# COPY gitea-data/gitea/conf/app.ini /data/data/gitea/conf/app.ini
# COPY gitea-data/gitea/options /data/data/gitea/options/
# COPY gitea-data/gitea/public/img data/data/gitea/public/img
# COPY gitea-data/gitea/templates data/data/gitea/templates
