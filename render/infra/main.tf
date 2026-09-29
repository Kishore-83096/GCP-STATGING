resource "render_web_service" "backend" {
  name              = var.backend_service_name
  plan              = "free"
  region            = "singapore"
  health_check_path = "/api/health"

  runtime_source = {
    docker = {
      repo_url        = var.repository_url
      branch          = "production"
      dockerfile_path = "./Dockerfile"
      context         = "."
      auto_deploy     = false
    }
  }

  lifecycle {
    ignore_changes = [env_vars]
  }
}

resource "render_env_group" "backend_runtime" {
  name = "${var.backend_service_name}-runtime"

  env_vars = {
    DATABASE_URL = {
      value = var.database_url
    }
    FRONTEND_URL = {
      value = var.frontend_url
    }
    JWT_SECRET_KEY = {
      value = var.jwt_secret_key
    }
  }
}

resource "render_env_group_link" "backend_runtime" {
  env_group_id = render_env_group.backend_runtime.id
  service_ids  = [render_web_service.backend.id]
}

resource "render_static_site" "frontend" {
  name           = var.frontend_site_name
  repo_url       = var.repository_url
  branch         = "production"
  root_directory = "frontend"
  build_command  = "npm ci && npm run build"
  publish_path   = "build"
  auto_deploy    = false

  env_vars = {
    REACT_APP_BACKEND_URL = {
      value = render_web_service.backend.url
    }
  }
}