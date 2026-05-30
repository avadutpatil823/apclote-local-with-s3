FROM amazoncorretto:21

RUN yum update -y && \
    amazon-linux-extras install epel -y || true && \
    yum install -y tar gzip xz && \
    yum clean all

# Install FFmpeg manually
RUN curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ffmpeg.tar.xz && \
    tar -xf ffmpeg.tar.xz && \
    mv ffmpeg-*-amd64-static/ffmpeg /usr/local/bin/ && \
    mv ffmpeg-*-amd64-static/ffprobe /usr/local/bin/ && \
    chmod +x /usr/local/bin/ffmpeg && \
    chmod +x /usr/local/bin/ffprobe && \
    rm -rf ffmpeg*


WORKDIR /app

COPY target/APCLOTE-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 9898

ENTRYPOINT ["java", "-jar", "app.jar"]