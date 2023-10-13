import requests
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from chrome_ux_report_project.settings import APIKEY

class ChromeUXReportView(APIView):

    def get(self, request):
        try:
            urls = request.query_params.get('url', '').split(',')

            if not urls:
                return Response({'error': 'URL parameter is missing.'}, status=status.HTTP_400_BAD_REQUEST)

            result_data = []
            for url in urls:
                api_url = f'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key={APIKEY}'
                data = {
                    "formFactor": "PHONE",
                    "origin": url.strip(),
                    "metrics": [
                        "largest_contentful_paint",
                        "experimental_time_to_first_byte",
                        "first_input_delay",
                        "cumulative_layout_shift",
                        "first_contentful_paint"
                    ]
                }

                response = self._get_chrome_ux_report_data(api_url, data)

                if response.status_code == 200:
                    report_data = response.json()
                    self._process_histogram(report_data)
                    result_data.append(report_data)
                else:
                    result_data.append({'error': f'Failed to fetch Chrome UX Report data for {url}.'})

            return Response(result_data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_chrome_ux_report_data(self, api_url, data):
        try:
            response = requests.post(api_url, json=data)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            raise Exception(f'Failed to fetch Chrome UX Report data: {str(e)}')

    def _process_histogram(self, report_data):
        record_metrics = report_data["record"]['metrics']
        for metric in record_metrics:
            histogram = record_metrics[metric]['histogram']
            histogram_ranges = []
            densities = []
            total_density = 0
            sum_values = 0

            for item in histogram:
                start = float(item.get('start', 0))  
                end = float(item.get('end', 0)) if item.get('end') else 0 
                histogram_ranges.append([start, end])
                density = round(item['density'], 3)
                densities.append(density)
                total_density += density
                sum_values += start * density

            record_metrics[metric]['histogram'] = {
                'histogram_ranges': histogram_ranges,
                'densities': densities,
                'average_density': round(total_density / len(histogram), 3),
                'sum_values': round(sum_values,3)
            }

