// © 2026 Mountain Jewels LLC. All rights reserved.

import { scraperFetch } from './scraper-client'

export interface StateData { code: string; name: string; population: number; avgHomeValue: number }
export interface CountyData { fips: string; name: string; population: number; avgHomeValue: number }
export interface CityData { name: string; population: number; avgHomeValue: number }
export interface TownData { name: string; population: number; avgHomeValue: number }
export interface ZipData { code: string; population: number; avgHomeValue: number }

export const getStates = () => scraperFetch<StateData[]>('/geo/states')
export const getCounties = (stateCode: string) => scraperFetch<CountyData[]>(`/geo/states/${stateCode}/counties`)
export const getCitiesByState = (stateCode: string) => scraperFetch<CityData[]>(`/geo/states/${stateCode}/cities`)
export const getCitiesByCounty = (fips: string) => scraperFetch<CityData[]>(`/geo/counties/${fips}/cities`)
export const getTowns = (cityName: string, stateCode: string) =>
  scraperFetch<TownData[]>(`/geo/cities/${encodeURIComponent(cityName)}/towns?state=${stateCode}`)
export const getZips = (cityName: string, stateCode: string) =>
  scraperFetch<ZipData[]>(`/geo/cities/${encodeURIComponent(cityName)}/zips?state=${stateCode}`)
