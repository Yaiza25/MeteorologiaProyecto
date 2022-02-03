FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:5000

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["ReadApi.csproj", "./"]
RUN dotnet restore "ReadApi.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "ReadApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ReadApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ReadApi.dll"]

# docker build -f Dockerfile -t readapi:1.0 .