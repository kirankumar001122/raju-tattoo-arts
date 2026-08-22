FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN apt-get update && apt-get install -y maven && mvn clean package -DskipTests

EXPOSE 10000

CMD ["java", "-jar", "target/raju-tattoo-backend-0.0.1-SNAPSHOT.jar"]