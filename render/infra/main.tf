resource "render_web_service" "backend" {
  name              = var.backend_service_name
  plan              = "free"
  region            = var.backend_region
  health_check_path = "/api/health"

  runtime_source = {
    docker = {
      repo_url        = var.repository_url
      branch          = var.backend_branch
      dockerfile_path = "./Dockerfile"
      context         = "."
      auto_deploy     = false
    }
  }

  env_vars = {
    FRONTEND_URL = {
      value = "https://${var.frontend_site_name}.onrender.com"
    }
  }
}

resource "render_static_site" "frontend" {
  name           = var.frontend_site_name
  repo_url       = var.repository_url
  branch         = var.frontend_branch
  root_directory = "frontend"
  build_command  = "npm ci && npm run build"
  publish_path   = "build"
  auto_deploy    = false

  env_vars = {
    REACT_APP_BACKEND_URL = {
      value = "https://${var.backend_service_name}.onrender.com"
    }
  }
}