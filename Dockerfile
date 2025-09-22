# Stage 1: build with Maven + JDK21
FROM jelastic/maven:3.9.5-openjdk-21 AS build
WORKDIR /app

# Copy only pom first so dependencies can be cached
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn -B clean package -DskipTests

# Stage 2: runtime (slim)
FROM openjdk:21-jdk-slim
WORKDIR /app

# Copy built jar from build stage (path is /app/target/*.jar)
COPY --from=build /app/target/*.jar app.jar

EXPOSE 9090
ENTRYPOINT ["java","-jar","/app/app.jar"]
