from rest_framework import serializers
from .models import Volunteer, Event, DonationCampaign


class VolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volunteer
        fields = ['id', 'name', 'email', 'phone', 'skills', 'availability', 'status', 'created_at']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'location', 'date', 'capacity', 'description', 'created_at']


class DonationCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationCampaign
        fields = '__all__'
