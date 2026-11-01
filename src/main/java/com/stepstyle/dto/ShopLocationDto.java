package com.stepstyle.dto;

public class ShopLocationDto {

    private String shopName;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String phoneNumber;
    private String openingHours;
    private Double latitude;
    private Double longitude;

    public ShopLocationDto() {
    }

    public ShopLocationDto(String shopName, String address, String city, String state, String postalCode,
                           String phoneNumber, String openingHours, Double latitude, Double longitude) {
        this.shopName = shopName;
        this.address = address;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.phoneNumber = phoneNumber;
        this.openingHours = openingHours;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getOpeningHours() {
        return openingHours;
    }

    public void setOpeningHours(String openingHours) {
        this.openingHours = openingHours;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
