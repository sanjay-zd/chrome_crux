from django.contrib import admin
from django.urls import path
from chrome_ux_report_app.views import ChromeUXReportView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chrome-ux-report/', ChromeUXReportView.as_view(), name='chrome-ux-report'),
]
