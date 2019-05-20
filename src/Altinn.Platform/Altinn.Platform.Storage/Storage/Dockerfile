FROM mcr.microsoft.com/dotnet/core/aspnet:2.2 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS build
WORKDIR /src
COPY ["Altinn.Platform.Storage.csproj", "."]
RUN dotnet restore "Altinn.Platform.Storage.csproj"
COPY . .
RUN dotnet build "Altinn.Platform.Storage.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "Altinn.Platform.Storage.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "Altinn.Platform.Storage.dll"]