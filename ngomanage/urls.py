from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'volunteers', views.VolunteerViewSet)
router.register(r'events', views.EventViewSet)

urlpatterns = [
    path('health/', views.health_view, name='health'),
    path('', include(router.urls)),
    path('ai/donation-campaign/', views.donation_campaign_view, name='donation-campaign'),
    path('ai/poster-caption/', views.poster_caption_view, name='poster-caption'),
    path('ai/chatbot/', views.chatbot_view, name='chatbot'),
    path('ai/awareness/', views.awareness_view, name='awareness'),
    path('ai/social/', views.social_media_view, name='social'),
]
