---
publish: true
relates: 
 - "[[dotnet/index|.Net]]"
---


  ```csharp
  var builder = WebApplication.CreateBuilder(args);
  var app = builder.Build();
  app.MapGet("/", () => "Hello World");
  app.Run();
  ```
