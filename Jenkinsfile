#!groovy

library identifier: '3scale-toolbox-jenkins@master', retriever: modernSCM([$class: 'GitSCMSource', credentialsId: '', remote: 'https://github.com/rh-integration/3scale-toolbox-jenkins.git', traits: [gitBranchDiscovery()]])

def service = null

node() {
    stage("checkout") {
        checkout scm
    }
    
    stage("Prepare") {
        service = toolbox.prepareThreescaleService(
            openapi: [filename: params.PARAMS_OPENAPI_SPEC],
            environment: [ baseSystemName: params.APP_NAME,
    					   privateBaseUrl: params.PRIVATE_URL],
            toolbox: [ openshiftProject: params.OCP_PROJECT,
                       destination: params.INSTANCE,
                       insecure: "yes",
                       image: "quay.io/redhat/3scale-toolbox:v0.17.1",
                       secretName: params.SECRET_NAME],
            service: [:],
            applications: [
                [ name: "my-test-app", description: "This is used for tests", plan: "test", account: 14 ]
            ],
            applicationPlans: [
              [ systemName: "test", name: "Test", defaultPlan: true, published: true ],
              [ systemName: "silver", name: "Silver" ],
              [ systemName: "gold", name: "Gold" ],
            ]
        )
        echo "toolbox version = " + service.toolbox.getToolboxVersion()
    }
    
    stage("Import OpenAPI") {
        service.importOpenAPI()
        echo "Service with system_name ${service.environment.targetSystemName} created !"
    }
    
    stage("Create an Application Plan") {
        service.applyApplicationPlans()
    }
    
    stage("Create an Application") {
        service.applyApplication()
    }
    
    stage("Run integration tests") {
        // To run the integration tests when using APIcast SaaS instances, we need
        // to fetch the proxy definition to extract the staging public url
        def proxy = service.readProxy("sandbox")
        def userkey = service.applications[0].userkey
        sh """set -e
        echo "Public Staging Base URL is ${proxy.sandbox_endpoint}"
        echo "userkey is ${userkey}"
        curl -sfk -w "Get Cats: %{http_code}\n" -o /dev/null ${proxy.sandbox_endpoint}${TEST_ENDPOINT} -H 'api-key: ${userkey}'
        """
    }
    
    stage("Promote to production") {
        service.promoteToProduction()
    }
}
