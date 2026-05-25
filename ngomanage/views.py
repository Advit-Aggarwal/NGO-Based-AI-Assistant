import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import viewsets, status
from rest_framework.response import Response

from .models import Volunteer, Event, DonationCampaign
from .serializers import VolunteerSerializer, EventSerializer, DonationCampaignSerializer
from . import ai_engine


def index_view(request):
    """Serve the main SPA template."""
    return render(request, 'index.html')


# -------------------- Health --------------------
@csrf_exempt
def health_view(request):
    return JsonResponse({'ok': True, 'name': 'NGO Management & Outreach Assistant'})


# -------------------- DRF ViewSets --------------------
class VolunteerViewSet(viewsets.ModelViewSet):
    queryset = Volunteer.objects.all()
    serializer_class = VolunteerSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


# -------------------- AI Endpoints --------------------
@csrf_exempt
@require_http_methods(['POST'])
def donation_campaign_view(request):
    try:
        data = json.loads(request.body)
        result = ai_engine.generate_donation_campaign(data)
        return JsonResponse(result)
    except (json.JSONDecodeError, KeyError) as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(['POST'])
def poster_caption_view(request):
    try:
        data = json.loads(request.body)
        result = ai_engine.generate_poster_and_caption(data)
        return JsonResponse(result)
    except (json.JSONDecodeError, KeyError) as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(['POST'])
def chatbot_view(request):
    try:
        data = json.loads(request.body)
        result = ai_engine.chatbot_reply(data)
        return JsonResponse(result)
    except (json.JSONDecodeError, KeyError) as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(['POST'])
def awareness_view(request):
    try:
        data = json.loads(request.body)
        result = ai_engine.awareness_suggestions(data)
        return JsonResponse(result)
    except (json.JSONDecodeError, KeyError) as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(['POST'])
def social_media_view(request):
    try:
        data = json.loads(request.body)
        result = ai_engine.social_media_content(data)
        return JsonResponse(result)
    except (json.JSONDecodeError, KeyError) as e:
        return JsonResponse({'error': str(e)}, status=400)
