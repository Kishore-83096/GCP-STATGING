output "backend_service_id" {
  description = "Render Web Service ID; configure as GitHub production variable RENDER_BACKEND_SERVICE_ID."
  value       = render_web_service.backend.id
}

output "backend_url" {
  description = "Render-generated backend URL."
  value       = render_web_service.backend.url
}

output "frontend_site_id" {
  description = "Render Static Site ID; configure as GitHub production variable RENDER_FRONTEND_SERVICE_ID."
  value       = render_static_site.frontend.id
}

output "frontend_url" {
  description = "Render-generated frontend URL."
  value       = render_static_site.frontend.url
}